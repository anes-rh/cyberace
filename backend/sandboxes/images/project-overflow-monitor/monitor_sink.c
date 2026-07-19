/*
 * Collecteur d'évènements d'« Opération Overflow ». Écoute en TCP sur :9000,
 * horodate chaque ligne reçue (UTC ISO) et l'ajoute à /var/log/overflow/events.log.
 * Les services vulnérables y envoient :
 *   "<service> CRASH"      à chaque enfant tué par SIGSEGV/SIGABRT/SIGBUS
 *   "<service> FLAG-READ"  quand le shell obtenu exécute `getflag` (= succès)
 * Le joueur lit ce journal via le terminal du monitor ; les objectifs
 * forensiques (6, 7) sont validés côté serveur par lecture directe du fichier.
 */
#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <time.h>
#include <signal.h>
#include <sys/socket.h>
#include <netinet/in.h>

static const char *LOGF = "/var/log/overflow/events.log";

int main(void) {
  signal(SIGCHLD, SIG_IGN);            /* auto-reape : pas de zombies */
  system("mkdir -p /var/log/overflow && touch /var/log/overflow/events.log");

  int s = socket(AF_INET, SOCK_STREAM, 0);
  int one = 1;
  setsockopt(s, SOL_SOCKET, SO_REUSEADDR, &one, sizeof one);
  struct sockaddr_in a;
  memset(&a, 0, sizeof a);
  a.sin_family = AF_INET;
  a.sin_addr.s_addr = INADDR_ANY;
  a.sin_port = htons(9000);
  if (bind(s, (struct sockaddr *)&a, sizeof a) < 0) { perror("bind"); return 1; }
  listen(s, 64);
  printf("monitor sink listening on 9000\n");
  fflush(stdout);

  for (;;) {
    int c = accept(s, NULL, NULL);
    if (c < 0) continue;
    if (fork() == 0) {
      char buf[1024];
      int n = read(c, buf, sizeof buf - 1);
      if (n > 0) {
        buf[n] = '\0';
        time_t t = time(NULL);
        struct tm tm;
        gmtime_r(&t, &tm);
        char ts[32];
        strftime(ts, sizeof ts, "%Y-%m-%dT%H:%M:%SZ", &tm);
        FILE *f = fopen(LOGF, "a");
        if (f) {
          char *save = NULL;
          for (char *line = strtok_r(buf, "\r\n", &save); line; line = strtok_r(NULL, "\r\n", &save)) {
            if (*line) fprintf(f, "%s %s\n", ts, line);
          }
          fclose(f);
        }
      }
      close(c);
      _exit(0);
    }
    close(c);
  }
}
