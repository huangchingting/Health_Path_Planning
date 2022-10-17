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

    // $start_end["start_lat"] = 24.123552;
    // $start_end["start_lng"] = 120.675326;
    // $start_end["end_lat"] = 24.1372593;
    // $start_end["end_lng"] = 120.6866658999998;

    $obj = $_POST['myData'];
    $start_end = json_decode($obj,true);

    // echo print_r($start_end["start_lat"]);

    if($start_end["start_lat"]>$start_end["end_lat"]){
        $lat1 = $start_end["start_lat"];
        $lat2 = $start_end["end_lat"];
    }else{
        $lat1 = $start_end["end_lat"];
        $lat2 = $start_end["start_lat"];
    }

    if($start_end["start_lng"]>$start_end["end_lng"]){
        $lng1 = $start_end["start_lng"];
        $lng2 = $start_end["end_lng"];
    }else{
        $lng1 = $start_end["end_lng"];
        $lng2 = $start_end["start_lng"];
    }


    // $sql = "SELECT `latitude`,`longitude`,`pm25` FROM `intersection_pm25` WHERE latitude<'$lat1' and latitude>'$lat2' and longitude<'$lng1' and longitude>'$lng2'";
    $sql = "SELECT `latitude`,`longitude`,`pm25` FROM `airbox_data` WHERE latitude<'$lat1'+0.005 and latitude>'$lat2'-0.005 and longitude<'$lng1'+0.005 and longitude>'$lng2'-0.005 order by latitude";
    $result = mysqli_query($mysqli, $sql);
    $num=mysqli_num_rows($result);
    // echo $num;

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