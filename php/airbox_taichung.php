<?php
	header("Access-Control-Allow-Origin: *");
	$dbservername = "localhost";
	$dbUsername = "userone";
	$dbPassword = "userpasswd";
	$dbName = "db_project";
	
	$mysqli = mysqli_connect($dbservername, $dbUsername, $dbPassword, $dbName);
	if (!$mysqli) {
		die("Connection failed: " . mysqli_connect_error());
	}
	mysqli_query($mysqli,"SET NAMES UTF8");

	$return_arr = array();
	$info="SELECT id,device_id,latitude,longitude,pm25 FROM airbox_data";
	$result = mysqli_query($mysqli, $info);

	$num=0;
	while ($row = mysqli_fetch_assoc($result)) {
		$row_array['type']="Feature";
		$row_array['id']=$num++;
		$row_array['geometry']['type']="Point";
		$row_array['geometry']['coordinates'][0] = (floatval)($row['longitude']);
		$row_array['geometry']['coordinates'][1] = (floatval)($row['latitude']);
		$row_array['properties']['id']=(doubleval)($row['id']);
		$row_array['properties']['device_id']=$row['device_id'];
		$row_array['properties']['pm25']=(doubleval)($row['pm25']);
		array_push($return_arr,$row_array);
	}
	

	$dot=json_encode($return_arr);
	$dot='{"type": "FeatureCollection","features":'.json_encode($return_arr).'}';
	echo $dot;
?>