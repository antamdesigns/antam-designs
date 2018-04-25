<?php

/**
 * videos_APIdownload short summary.
 *
 * videos_APIdownload description.
 *
 * @version 1.0
 * @author millera
 */
/* gets the data from a URL */
function get_data($url) {
	$ch = curl_init();
	$timeout = 5;
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
	$data = curl_exec($ch);
	curl_close($ch);
	return $data;}

$returned_content = get_data('http://localhost:13933/videos.html?XDEBUG_SESSION_START=6A951242');

$keywords = array();
$domain = array('http://localhost:13933/videos.html?XDEBUG_SESSION_START=6A951242');
$doc = new DOMDocument;
$doc->preserveWhiteSpace = FALSE;
foreach ($domain as $key => $value) {
    @$doc->loadHTMLFile($value);
    $anchor_tags = $doc->getElementsByTagName('a');
    foreach ($anchor_tags as $tag) {
        $keywords[] = strtolower($tag->nodeValue);
    }
}

$file = fopen ("ftp://ftp.example.com/incoming/outputfile", "w");
if (!$file) {
    echo "<p>Unable to open remote file for writing.\n";
    exit;
}
/* Write the data here. */
fwrite ($file, $_SERVER['C:\temp\Brightcove_incoming\8_hour\Video Files'] . "\n");
fclose ($file);