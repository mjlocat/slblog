#!/bin/sh

cat << EOF

Welcome to the slblog installer

We'll get things set up, then ask some questions to help
configure things. You can cancel the installer at any time
by pressing Ctrl-C. Your previous selections will be saved
so you can run this script again with your previous selections
as default options next time.

EOF

sleep 5

yarn

yarn start-install
