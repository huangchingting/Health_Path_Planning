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
    $info="SELECT * FROM traffic";
    $result = mysqli_query($mysqli, $info);
    $num=mysqli_num_rows($result);
    while ($row = mysqli_fetch_assoc($result)) {
        $row_array['type'] = "Feature";
        // $row_array['features']['type'] = "Feature";
        // $row_array['features']['properties']['stroke']="#ff0000";
        // $row_array['features']['properties']['stroke-width']=10;
        // $row_array['features']['properties']['stroke-opacity']=0.5;
        $row_array['geometry']['type'] = "LineString";
        $row_array['geometry']['coordinates'][0][0] = (doubleval)($row['longitude_1']);
        $row_array['geometry']['coordinates'][0][1] = (doubleval)($row['latitude_1']);
        $row_array['geometry']['coordinates'][1][0] = (doubleval)($row['longitude_2']);
        $row_array['geometry']['coordinates'][1][1] = (doubleval)($row['latitude_2']);
        $row_array['properties']['speed']=(doubleval)($row['value']);
        if($row['value']<=14) $row_array['properties']['color']="#f00";
        elseif ($row['value']<=34) $row_array['properties']['color']="#FFD700";
        else $row_array['properties']['color']="#33cc33";
        
        // $row_array['properties']['road_id']=$row['routeid'];
        // $row_array['properties']['level']=(doubleval)($row['level']);
        array_push($return_arr,$row_array);
    }
    $dot=json_encode($return_arr);
    $dot='{"type": "FeatureCollection","features":'.json_encode($return_arr).'}';
    echo $dot;
?>