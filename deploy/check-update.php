<?php
// Run on Unraid only. Updates the native Docker badge and posts browser reminders.
// This script never pulls images, restarts containers, or sends email.
$_SERVER['DOCUMENT_ROOT'] = '/usr/local/emhttp';
$_SERVER['REQUEST_URI'] = 'docker';
require_once '/usr/local/emhttp/plugins/dynamix.docker.manager/include/DockerClient.php';

$image = 'ghcr.io/otamarau/benjury-dev:main';
$lock = fopen('/var/tmp/benjury-dev-update.lock', 'c');
if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) exit(0);

$client = new DockerClient();
$website = null;
foreach ($client->getDockerContainers() as $container) {
    if ($container['Name'] === 'benjury-dev') $website = $container;
}
// Respect a deliberate rollback to a fixed tag.
if (!$website || $website['Image'] !== $image) exit(0);

$updates = new DockerUpdate();
$updates->reloadUpdateStatus($image);
$status = $updates->getUpdateStatus($image);
$stateFile = '/var/tmp/benjury-dev-update-notified';
if ($status === true) {
    if (file_exists($stateFile)) unlink($stateFile);
    echo "Website is up to date.\n";
    exit(0);
}
if ($status !== false) {
    fwrite(STDERR, "Could not determine website update status.\n");
    exit(1);
}

$state = DockerUtil::loadJSON($dockerManPaths['update-status']);
$digest = $state[$image]['remote'];
if (file_exists($stateFile) && trim(file_get_contents($stateFile)) === $digest) exit(0);

$args = [
    '-e', 'Website update',
    '-s', 'benjury.dev update available',
    '-d', 'A tested GitHub build is ready. Open Docker and apply the update for benjury-dev.',
    '-i', 'normal 1', // Unraid notification destination bitmask: browser only.
    '-l', '/Docker', '-x',
];
exec('/usr/local/emhttp/webGui/scripts/notify ' . implode(' ', array_map('escapeshellarg', $args)), $output, $exitCode);
if ($exitCode !== 0) exit($exitCode);
file_put_contents($stateFile, $digest);
echo "Website update reminder posted.\n";
