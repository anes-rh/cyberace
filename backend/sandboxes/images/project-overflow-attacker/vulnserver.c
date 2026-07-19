/*
 * Service réseau vulnérable d'« Opération Overflow » (checkpoint projets).
 *
 * UN SEUL source, compilé en 4 binaires (niveaux 1→4) avec des protections
 * mémoire croissantes (voir le Dockerfile). Serveur qui FORKE par connexion et
 * câble la socket sur stdin/stdout/stderr de l'enfant : un simple shellcode
 * execve("/bin/sh") donne donc un shell interactif au-dessus de la connexion
 * (service pwn classique). La fonction vulnérable `vuln()` n'a qu'un seul
 * tampon de pile (buf[64]) → l'offset jusqu'à l'adresse de retour sauvegardée
 * est petit et net.
 *
 * Propriété clé de conception (validée en amont sur le démon distant) : un
 * serveur qui forke SANS ré-exec fait hériter à tous ses enfants la même base
 * libc ET le même canari que le parent (fixés à l'exec du parent). Donc :
 *   - une seule fuite d'info (niveau 3/4) casse l'ASLR pour toute la session ;
 *   - le canari fuité reste valide de connexion en connexion ;
 *   - le serveur peut publier son canari dans un fichier lu indépendamment
 *     côté serveur (validation `dynamic_text_compare`).
 *
 * Drapeaux de compilation :
 *   WITH_GADGET  embarque un gadget `jmp rsp` (ret2reg) pour le niveau 1.
 *   LEAK_DEBUG   commande « DEBUG » qui divulgue par erreur un pointeur libc.
 *   FMT_BUG      commande « ECHO <x> » avec printf(x) non filtré (format string).
 */
#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>
#include <errno.h>
#include <sys/wait.h>
#include <sys/socket.h>
#include <sys/time.h>
#include <netinet/in.h>
#include <netdb.h>

static const char *SERVICE = "vuln";
static volatile sig_atomic_t crash_pending = 0;

/* Envoie une ligne d'évènement au collecteur `monitor` (best-effort, hors
 * handler de signal → getaddrinfo/connect sont sûrs ici). */
static void report(const char *event) {
  struct addrinfo hints, *res = NULL;
  memset(&hints, 0, sizeof hints);
  hints.ai_family = AF_INET;
  hints.ai_socktype = SOCK_STREAM;
  if (getaddrinfo("monitor", "9000", &hints, &res) != 0 || !res) return;
  int fd = socket(res->ai_family, res->ai_socktype, 0);
  if (fd >= 0) {
    struct timeval tv = { 2, 0 };
    setsockopt(fd, SOL_SOCKET, SO_SNDTIMEO, &tv, sizeof tv);
    setsockopt(fd, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof tv);
    if (connect(fd, res->ai_addr, res->ai_addrlen) == 0) {
      char line[160];
      int n = snprintf(line, sizeof line, "%s %s\n", SERVICE, event);
      if (n > 0) { ssize_t w = write(fd, line, (size_t)n); (void)w; }
    }
    close(fd);
  }
  freeaddrinfo(res);
}

static unsigned long read_canary(void) {
  unsigned long c;
  __asm__ volatile ("mov %%fs:0x28, %0" : "=r"(c));
  return c;
}

#ifdef WITH_GADGET
/* Gadget `jmp rsp` (octets ff e4) garanti présent dans le binaire non-PIE du
 * niveau 1 : permet un ret2reg vers le shellcode déposé sur la pile, sans
 * connaître d'adresse de pile. Jamais appelé. */
__attribute__((used)) static void gadget(void) { __asm__ volatile ("jmp *%rsp"); }
#endif

/* Fonction VULNÉRABLE : buf[64] est son seul tampon de pile → offset propre. */
static void vuln(const char *in, int n) {
  char buf[64];
  if (n > 0) memcpy(buf, in, (size_t)n);   /* débordement de pile */
  (void)buf;
}

static void child(int fd) {
  dup2(fd, 0); dup2(fd, 1); dup2(fd, 2);   /* la socket devient stdio */
  static char in[1024];                    /* tampon de lecture HORS de la frame de vuln()
                                              → l'offset buf→retour de vuln() reste petit et
                                              net ; la fuite de format string (niveau 4) lit
                                              directement le canari (%29$p) et un pointeur
                                              libc (%58$p) sur la pile */
  char banner[160];
  int b = snprintf(banner, sizeof banner,
                   "=== NOVA net-service [%s] ===\nenvoie ta donnee (max 1024o). 'HELP' pour l'aide.\n",
                   SERVICE);
  if (b > 0) { ssize_t w = write(fd, banner, (size_t)b); (void)w; }

  int n = read(fd, in, sizeof in);
  if (n <= 0) return;

  if (n >= 4 && memcmp(in, "HELP", 4) == 0) {
    const char *h =
#if defined(LEAK_DEBUG)
      "commandes: HELP | DEBUG (diagnostic interne)\n"
#elif defined(FMT_BUG)
      "commandes: HELP | ECHO <texte>\n"
#else
      "commandes: HELP\n"
#endif
      ;
    ssize_t w = write(fd, h, strlen(h)); (void)w;
    return;
  }
#if defined(LEAK_DEBUG)
  if (n >= 5 && memcmp(in, "DEBUG", 5) == 0) {
    /* fuite « par erreur » d'un pointeur libc (dump de diagnostic). */
    char out[160];
    int m = snprintf(out, sizeof out, "[diag] puts=%p (reference de build)\n", (void *)&puts);
    if (m > 0) { ssize_t w = write(fd, out, (size_t)m); (void)w; }
    return;
  }
#endif
#if defined(FMT_BUG)
  if (n >= 5 && memcmp(in, "ECHO ", 5) == 0) {
    in[n < (int)sizeof in ? n : (int)sizeof in - 1] = '\0';
    printf(in + 5);          /* BUG de chaîne de format : format contrôlé par l'utilisateur */
    fflush(stdout);
    return;
  }
#endif
  vuln(in, n);               /* chemin vulnérable par défaut */
}

static void on_sigchld(int sig) {
  (void)sig;
  int st;
  pid_t p;
  while ((p = waitpid(-1, &st, WNOHANG)) > 0) {
    if (WIFSIGNALED(st)) {
      int t = WTERMSIG(st);
      if (t == SIGSEGV || t == SIGABRT || t == SIGBUS) crash_pending++;
    }
  }
}

static void flush_crashes(void) {
  int pend = crash_pending;
  crash_pending = 0;
  while (pend-- > 0) report("CRASH");
}

int main(int argc, char **argv) {
  int port = argc > 1 ? atoi(argv[1]) : 9001;
  if (argc > 2) SERVICE = argv[2];
  setvbuf(stdout, NULL, _IONBF, 0);

  /* Publie le canari courant pour une relecture serveur indépendante (niv. 4). */
  system("mkdir -p /run/overflow");
  FILE *cf = fopen("/run/overflow/canary", "w");
  if (cf) { fprintf(cf, "%lx\n", read_canary()); fclose(cf); }

  /* Handler SIGCHLD : reape + compte les crashs (l'envoi se fait hors handler). */
  struct sigaction sa;
  memset(&sa, 0, sizeof sa);
  sa.sa_handler = on_sigchld;
  sa.sa_flags = SA_NOCLDSTOP;    /* PAS de SA_RESTART → accept() renvoie EINTR */
  sigaction(SIGCHLD, &sa, NULL);

  int s = socket(AF_INET, SOCK_STREAM, 0);
  int one = 1;
  setsockopt(s, SOL_SOCKET, SO_REUSEADDR, &one, sizeof one);
  struct sockaddr_in a;
  memset(&a, 0, sizeof a);
  a.sin_family = AF_INET;
  a.sin_addr.s_addr = INADDR_ANY;
  a.sin_port = htons(port);
  if (bind(s, (struct sockaddr *)&a, sizeof a) < 0) { perror("bind"); return 1; }
  listen(s, 32);
  printf("%s listening on %d pid=%d\n", SERVICE, port, getpid());

  for (;;) {
    int c = accept(s, NULL, NULL);
    if (c < 0) {
      if (errno == EINTR) flush_crashes();   /* interrompu par SIGCHLD */
      continue;
    }
    flush_crashes();
    pid_t pid = fork();
    if (pid == 0) { close(s); child(c); close(c); _exit(0); }
    close(c);
  }
}
