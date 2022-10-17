function traffic(){
    var url = 'php/traffic.php';
    
    var layer_r = new google.maps.Data();
    layer_r.loadGeoJson(url);
    layer_r.setStyle(function(feature){
        return ({
            'strokeColor': feature.getProperty('color'),
            'strokeWeight': 1.5
        });
    });
    // layer_r.setMap(map);
    // layer_r.set(null);

    $('#ckb_traffic').click(function(){
        if($('#ckb_traffic').prop("checked")){
            layer_r.setMap(map); 
        }else{
            layer_r.setMap(null);
        }
    });
}