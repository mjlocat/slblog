#!/bin/sh
# HOOK_DIR=$(git rev-parse --show-toplevel)/.githooks
# git config --local core.hooksPath ${HOOK_DIR}

find .git/hooks -type l -exec rm {} \; && find .githooks -type f -exec ln -sf ../../{} .git/hooks/ \;
