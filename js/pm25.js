function get_pm25(){
	$.ajax({
		type: "GET",
		dataType: "json",
		url: "./php/airbox_taichung.php",
		success: function(data){
			console.log("success");
			pm25(data);
		},
		error: function(e){
			console.log("error");
			console.log(e.message);
		}
	});
}


function pm25(point){
	var overlay = new google.maps.OverlayView(); //OverLayオブジェクトの作成

	//オーバレイ追加
	overlay.onAdd = function () {
		var layer = d3.select(this.getPanes().overlayLayer).append("div").attr("class", "SvgOverlay");
		var svg = layer.append("svg");
		var svgoverlay = svg.append("g").attr("class", "AdminDivisions");
		

		//再描画時に呼ばれるコールバック    
		overlay.draw = function () {
			var markerOverlay = this;
			var overlayProjection = markerOverlay.getProjection();
	
			//Google Mapの投影法設定
			var googleMapProjection = function (coordinates) {
				var googleCoordinates = new google.maps.LatLng(coordinates[1], coordinates[0]);
				var pixelCoordinates = overlayProjection.fromLatLngToDivPixel(googleCoordinates);
				return [pixelCoordinates.x + 4000, pixelCoordinates.y + 4000];
			}

			//母点位置情報
			var pointdata = point.features;
			
			//ピクセルポジション情報
			var positions = [];

			pointdata.forEach(function(d) {	
				positions.push(googleMapProjection(d.geometry.coordinates)); //位置情報→ピクセル
			});
	
			//ボロノイ変換関数
			var polygons = d3.geom.voronoi(positions);
			// var polygons = d3.geom.polygon(positions);
			// console.log(polygons);
			
			var pathAttr ={
				"d": function(d, i) {
					if(polygons[i]!=null){
						return "M" + polygons[i].join("L") + "Z"
					}
				},
				stroke:"red",
				fill:"none"			
			};

			//境界表示
			svgoverlay.selectAll("path")
				.data(pointdata)
				.attr(pathAttr)
				.enter()
				.append("svg:path")
				.attr("class", "cell")
				.attr(pathAttr)
				.style("stroke-opacity", 0.2)
				
			//document.querySelectorAll("svg:path").forEach(polygon => polygon.style.fill = getRandomColor());

			var color = d3.scale.category20b();
			var yellow = d3.rgb('#FFBB00');
			// the location of air_box
			var circleAttr = {
			    "cx":function(d, i) { return positions[i][0]; },
			    "cy":function(d, i) { return positions[i][1]; },
			    "r":3,
			    fill:function(d, i) {
			    	if(d.properties.pm25<25) return "green";
			    	else if(d.properties.pm25<45) return yellow;
			    	else return "red";
			    }
			}
	
			//母点表示
			svgoverlay.selectAll("circle")
				.data(pointdata)
				.attr(circleAttr)
				.enter()
				.append("svg:circle")
				.attr(circleAttr)
		};

		overlay.hidden = function () {
			svgoverlay.selectAll("path")
				.style({ visibility: 'hidden' })
			svgoverlay.selectAll("circle")
				.style({ visibility: 'hidden' })
		};

		overlay.show = function () {
			svgoverlay.selectAll("path")
				.style({ visibility: 'visible' })
			svgoverlay.selectAll("circle")
				.style({ visibility: 'visible' })
		};
	};
	
	// initialize draw pm2.5 on map
	//$('#ckb_pm25').prop('checked', true);
	

	var ch=0;
	$('#ckb_pm25').click(function(){
		if(!ch){
			// initialize draw pm2.5 on map
			overlay.setMap(map);
			ch=1;
		}else{
			if($('#ckb_pm25').prop("checked")){
	            overlay.show();
	        }else{
	            overlay.hidden();
	        }
		}
    });
}

function getRandomColor() { 
	console.log("color");
	var letters = 'ABCDEF';
	var color = '#'; 
	for (var i = 0; i < 6; i++) { 
		color += letters[Math.floor(Math.random() * 16)]; 
	} 
	return color; 
} 