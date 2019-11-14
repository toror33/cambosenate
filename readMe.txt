
-start nodejs server-
pm2 start bin/www --name edu -o ./api.log -e ./api.log --merge-logs

-show the list of server-
pm2 list

-stop server-
pm2 stop id

-restart server-
pm2 restart id

-delete server-
pm2 delete id

-show about server-
pm2 show id

-server monitoring-
pm2 monit
