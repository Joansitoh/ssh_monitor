#!/bin/bash

ssh_failed_log="/var/log/netvisr/ssh_failed.log"
jail_log="/var/log/netvisr/jail.log"

total_lines=$(wc -l < "$ssh_failed_log")

count_ip_in_ssh_failed() {
    local ip="$1"
    local count=$(grep -c "$ip" "$ssh_failed_log")
    echo "$count"
}

# Check if the IP is already blocked
check_jail() {
    local ip="$1"
    if grep -q "$ip" "$jail_log"; then
        return 0
    else
        return 1
    fi
}

block_ip() {
    local ip="$1"
    echo "$ip" >> "$jail_log"
}

show_progress() {
    local current="$1"
    local total="$2"
    local percentage=$((current * 100 / total))
    local progress=$((current * 50 / total))
    printf "\rProgreso: [%-50s] %d%%" $(printf "#%.0s" $(seq 1 "$progress")) "$percentage"
}

progress_count=0
while IFS= read -r ip || [ -n "$ip" ]; do
    if ! check_jail "$ip"; then
        block_ip "$ip"
    fi

    progress_count=$((progress_count + 1))
    show_progress "$progress_count" "$total_lines"
done < "$jail_log"

progress_count=0
while IFS= read -r line || [ -n "$line" ]; do
    ip=$(echo "$line" | grep -oE "\b([0-9]{1,3}\.){3}[0-9]{1,3}\b")

    if ! check_jail "$ip"; then
        count=$(count_ip_in_ssh_failed "$ip")
        
        if [ "$count" -ge 5 ]; then
            block_ip "$ip"
        fi
    fi

    progress_count=$((progress_count + 1))
    show_progress "$progress_count" "$total_lines"
done < "$ssh_failed_log"