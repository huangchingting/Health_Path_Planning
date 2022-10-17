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

    // $sql = "SELECT `latitude`,`longitude`,`pm25` FROM `intersection_pm25` WHERE latitude<'$lat1' and latitude>'$lat2' and longitude<'$lng1' and longitude>'$lng2'";
    $sql = "SELECT `latitude`,`longitude`,`pm25` FROM `airbox_data`";
    $result = mysqli_query($mysqli, $sql);
    $num=mysqli_num_rows($result);

    $return_arr = array();
    while($row = mysqli_fetch_assoc($result)){
        // echo print_r($row['latitude']);
        $row_array['pm25'] = (doubleval)($row['pm25']);
        $row_array['coordinates'][0] = (doubleval)($row['latitude']);
        $row_array['coordinates'][1] = (doubleval)($row['longitude']);
        array_push($return_arr,$row_array);
    }


    $dot = '{"intersections":'.json_encode($return_arr).'}';
    echo $dot;
?>