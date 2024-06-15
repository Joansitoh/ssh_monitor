#!/bin/bash

jail_log="/var/log/netvisr/jail.log"

while  IFS= read -r IP; do 

iptables -A INPUT -s "$IP" -j DROP
done < "$jail_log"