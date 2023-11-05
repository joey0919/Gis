let sourceLine = new ol.source.Vector();
let sourceCircle = new ol.source.Vector();
let sourcePolygon = new ol.source.Vector();

var sketch;
var measureTooltipElement;
var measureTooltip;

//선 그리기 레이어
const layerVectorLine = new ol.layer.Vector({
	layerId: 'layerVectorLine',
    source: sourceLine,
    style : new ol.style.Style({
        fill: new ol.style.Fill({
	        color: 'rgba(255, 0, 127, 1)',
	    }), 
	    stroke: new ol.style.Stroke({
	        color: 'rgba(255, 0, 127, 1)',
	        width: 3,
	    }),
	    image: new ol.style.Circle({
	        radius: 5,
	        stroke: new ol.style.Stroke({
	            color: 'rgba(255, 0, 255, 1)',
	        }),
	        fill: new ol.style.Fill({
	            color: 'rgba(255, 255, 255, 1)',
	        }),
	    }),
	}),
});

//반경 그리기 레이어
const layerVectorCircle = new ol.layer.Vector({
	layerId: 'layerVectorCircle',
    source: sourceCircle,
	style : new ol.style.Style({
	    fill: new ol.style.Fill({
		    color: 'rgba(127, 0, 255, 0.2)',
		}), 
		stroke: new ol.style.Stroke({
		    color: 'rgba(127, 0, 255, 0.5)',
		    width: 3,
		}),
		image: new ol.style.Circle({
		    radius: 5,
		    stroke: new ol.style.Stroke({
		        color: 'rgba(127, 0, 255, 1)',
		    }),
		    fill: new ol.style.Fill({
		        color: 'rgba(127, 0, 255, 0.7)',
		    }),
		}),
	}),
});

//면적 구하기 레이어
const layerVectorPolygon = new ol.layer.Vector({
	layerId: 'layerVectorPolygon',
    source: sourcePolygon,
	style : new ol.style.Style({
	    fill: new ol.style.Fill({
		    color: 'rgba(0, 0, 255, 0.2)',
		}), 
		stroke: new ol.style.Stroke({
		    color: 'rgba(0, 0, 255, 1)',
		    width: 3,
		}),
		image: new ol.style.Circle({
		    radius: 5,
		    stroke: new ol.style.Stroke({
		        color: 'rgba(0, 0, 255, 1)',
		    }),
		    fill: new ol.style.Fill({
		        color: 'rgba(255, 255, 255, 0.7)',
		    }),
		}),
	}),
});

// 거리값 팝업창
function createMeasureTooltip(popupId) {
    if (measureTooltipElement) {
	    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
	}
	measureTooltipElement = document.createElement('div');
	measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
	measureTooltip = new ol.Overlay({
	    id: popupId,
	    element: measureTooltipElement,
	    offset: [0, 0],
	    positioning: 'bottom-center',
	    stopEvent: false,
	    insertFirst: false,
	});
    map.addOverlay(measureTooltip);
}

// 팝업창 지우기 클릭시 -> 선택된 레이어 + 팝업 제거
function deletePoly(selectedFeatureID, selectNum, popupId) {
    
	//line, circle, polygon 선택시 레이어 담을 변수
	var source;
	// source에 대한 feature
	var features;
	  
	if(selectNum == 1) {
        source = sourceLine;
		features = sourceLine.getFeatures();
	  }
	else if(selectNum == 2) {
        source = sourceCircle;
		features = sourceCircle.getFeatures();
	}
	else if(selectNum == 3) {
	    source = sourcePolygon;
		features = sourcePolygon.getFeatures();
	}

	if(features != null && features.length > 0) {
        for(x in features) {
            var properties = features[x];
			var id = properties.getId();
			  
		    map.getOverlays().getArray().forEach(function(overlay) {
	            if(overlay.getId() == popupId) {
	        	    map.removeOverlay(overlay);
	        	}
	        });
		    
			if(id == selectedFeatureID) {
		        source.removeFeature(features[x]);       
		    
		    }
	    }
	}
}

//거리 레이어 연산
function formatLength(line) {
    const length = ol.Sphere.getLength(line);
    let output;
	if (length > 100) {
		output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
	} 
	else {
		output = Math.round(length * 100) / 100 + ' ' + 'm';
	}
	return output;
}

// 면적 레이어 연산
function formatArea(polygon) {
    var area = ol.Sphere.getArea(polygon);
	let output;
	if (area > 10000) {
		output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
	} 
	else {
		output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
	}
	return output;
}
	
// 반경 레이어 연산
function formatCircle(circle) {
    var center = circle.getCenter();	
    let output;
	var radius = circle.getRadius();
		
	if(radius > 1000) {
	    output = Math.round((radius / 1000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
	}
	else {
	    output = Math.round(radius * 100) / 100 + ' ' + 'm<supb>2</sup>';
	}
	return output;
}

var excelPoly; //엑셀 다운시 담을 data

let draw;
// 도구 기능 실행
function addInteraction(e) {
    var type;
    var style;
    var source;
    	   
	if(e == 'line') {
        type='LineString';
        source = sourceLine;
        style = layerVectorLine.getStyle();
	}
	else if(e == 'polygon') {
		type='Polygon';
		source = sourcePolygon
		style = layerVectorPolygon.getStyle();
	}
	else if(e == 'circle') {
        type= 'Circle';
        source = sourceCircle;
        style = layerVectorCircle.getStyle();
	}
	
	if(draw) map.removeInteraction(draw);
	
	draw = new ol.interaction.Draw({
	    source: source,
	    type: type,
	    style: style,
    });    
	  
    map.addInteraction(draw);
    
    var popupId = sourceLine.getFeatures().length + sourceCircle.getFeatures().length + sourcePolygon.getFeatures().length + 1;
    
	createMeasureTooltip(popupId);
	
	let listener;
	draw.on('drawstart', function (evt) {

	    sketch = evt.feature;
	    
	    let tooltipCoord = evt.coordinate;

	    listener = sketch.getGeometry().on('change', function (evt) {
	        const geom = evt.target;
	        let output;
	        if (geom instanceof ol.geom.Polygon) {
	            output = '총 면적 ' + formatArea(geom);
	            tooltipCoord = geom.getLastCoordinate();
	        } 
	        else if (geom instanceof ol.geom.LineString) {
	            output = '총 거리 ' + formatLength(geom);
	            tooltipCoord = geom.getLastCoordinate();
	        } 
	        else if (geom instanceof ol.geom.Circle) {
	    	    output = '총 반경 ' + formatCircle(geom); 
	    	    tooltipCoord = geom.getLastCoordinate();
	        }
	        if(measureTooltipElement) measureTooltipElement.innerHTML = output;
	        if(measureTooltip) measureTooltip.setPosition(tooltipCoord);
	     
	    });
	  });

	  var selectedFeatureID;
	  
	  draw.on('drawend', function (evt) {
		  
		  
		  var popupId = measureTooltip.getId();
		  
		  var poly = evt.feature.getGeometry();
		  var count;
		  var selectNum;
		  
		  
		  if(poly instanceof ol.geom.LineString) {
			  selectNum = 1;
		  }
		  else if(poly instanceof ol.geom.Circle) {
			  selectNum = 2;
		  }
		  else if(poly instanceof ol.geom.Polygon) {
			  selectNum = 3;
		  }	
		  count = sourceLine.getFeatures().length + sourceCircle.getFeatures().length + sourcePolygon.getFeatures().length + 1;
		  evt.feature.setId(count);
		  
		  
		  var buildbutton;
		  if(selectNum == '3') {
			  
			  var loc_arr = poly.A;
			  buildbutton = '<a class="bldgBtn" onclick="buildInfoByPolygon('+loc_arr+')" style="background-image: url(' + getContextPath()+ '/img/common/i-build.svg); display: block; color: #fff; padding-top: 20px; width: 20px"></a>';
		  }
		  else {
			  buildbutton ='';
		  }
		  
		  measureTooltipElement.innerHTML = measureTooltipElement.innerHTML + buildbutton + "<div onclick='deletePoly(" + count + ","  + selectNum + "," + popupId + ")'>지우기</div>";;
	      measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
	      sketch = null;
	      measureTooltipElement = null;
	      //createMeasureTooltip(popupId);
	      ol.Observable.unByKey(listener);
	      map.removeInteraction(draw);
	  });
}

function convertNullValue(input, change, options) {
	if(!input || input==null || input=='' || input=='null') {
		return change;
	} else {
		if(options && options.isLocaleString) return input.toLocaleString();
		else return input;	
	}
}

function buildInfoByPolygon(...arr) {
	var poly = '';
	
	arr.forEach(function(e, i) {
		
		if(i % 2 == 1) {
			var lon = arr[i-1];
			var lat = arr[i];
			var loc = ol.proj.transform([lon, lat],'EPSG:3857','EPSG:4326');
			
			if(i == 1) {
				poly += 'POLYGON((';
				poly += loc[0];
				poly += ' ';
				poly += loc[1];
				
			}
			else {
				poly += ',';
				poly += loc[0];
				poly += ' ';
				poly += loc[1];
			}	
		}
	});
	poly += '))';
	
	let today = new Date(); //현재날짜 기준으로 weather 가져올거임.
	let month = today.getMonth()+1;
	let date = today.getDate();  // 날짜
	let hours = today.getHours(); //시간
	
	$.ajax({
		url : "ajax/getBuildByPoly.do",
		type : "POST",
		data : {poly: poly, month:month, date: date, hours: hours},
		async : true,
		dataType : "json",
		success : function(result) {
			if(result) {
				excelPoly = result;
				weatherpoly = result[result.length-1]; //날씨정보		
				result.pop(result.length-1);			    

				document.querySelector('#buildPoly-popup .content-div').innerHTML = '';
				document.querySelector('#buildPoly-tbody').innerHTML = '';
			    
				//$('#buildPoly-tbody').html('');
				
				for(let i=0 ; i<result.length ; i++) {
					//엑셀 위한 테이블
			    	var idd = '<td>'+convertNullValue(result[i].num, '')+'</td>';
			    	var pnu = '<td>'+convertNullValue(result[i].pnu, '')+'</td>';
			    	var bldNmE = '<td>'+convertNullValue(result[i].bld_nm, '')+'</td>';
			    	var totqty = '<td>'+convertNullValue(result[i].totuse, '')+'</td>';
			    	var qty1 = '<td>'+convertNullValue(result[i].use1, '')+'</td>';
			    	var qty2 = '<td>'+convertNullValue(result[i].use2, '')+'</td>';
			    	var qty3 = '<td>'+convertNullValue(result[i].use3, '')+'</td>';
			    	var totuse = '<td>'+convertNullValue(result[i].totqty, '')+'</td>';
			    	var use1 = '<td>'+convertNullValue(result[i].qty1, '')+'</td>';
			    	var use2 = '<td>'+convertNullValue(result[i].qty2,'')+'</td>';
			    	var use3 = '<td>'+convertNullValue(result[i].qty3, '')+'</td>';
					var pkAreaTable = '<td>'+convertNullValue(result[i].pk_area, '')+'</td>';
					var mainPurpsCdTable = '<td>'+convertNullValue(result[i].main_purps_cd, '')+'</td>';
					var mainPurpsCd2Table = '<td>'+convertNullValue(result[i].main_purps_cd2, '')+'</td>';
			    	var sggNm = '<td>'+convertNullValue(result[i].sgg_nm, '')+'</td>';
			    	var hjdNm = '<td>'+convertNullValue(result[i].hjd_nm,'')+'</td>';
			    	
			    	//사용량 전력, 도시가스 난방

			    	$('#buildPoly-tbody').append('<tr>'+idd + pnu + bldNmE +  totqty + qty1 + qty2 + qty3 + totuse + use1 + use2 + use3 + pkAreaTable + mainPurpsCdTable + mainPurpsCd2Table + sggNm + hjdNm +'</tr>');
			    	
					const data = result[i];
					const id = '<div class="w5p center">' + data.num + '</div>';
					const bldNm = '<div class="w15p center">' + convertNullValue(data.bld_nm, '-') + '</div>';
					
					// 에너지 사용량
			    	let use = '';
					use += '<div class="w7_5p right">' + convertNullValue(data.totuse, '-', {isLocaleString: true,}) + '</div>';
					use += '<div class="w7_5p right">' + convertNullValue(data.use1, '-', {isLocaleString: true,}) + '</div>';
					use += '<div class="w7_5p right">' + convertNullValue(data.use2, '-', {isLocaleString: true,}) + '</div>';
					use += '<div class="w7_5p right">' + convertNullValue(data.use3, '-', {isLocaleString: true,}) + '</div>';
					
					// 온실가스 배출량
					let qty = '';
					qty += '<div class="w7_5p right">' + convertNullValue(data.totqty, '-', {isLocaleString: true,}) + '</div>';
					qty += '<div class="w7_5p right">' + convertNullValue(data.qty1, '-', {isLocaleString: true,}) + '</div>';
					qty += '<div class="w7_5p right">' + convertNullValue(data.qty2, '-', {isLocaleString: true,}) + '</div>';
					qty += '<div class="w7_5p right">' + convertNullValue(data.qty3, '-', {isLocaleString: true,}) + '</div>';

					const pk_area		 = '<div class="w10p center">' + convertNullValue(data.pk_area, '-', {isLocaleString: true,}) + '</div>';
					const main_purps_cd  = '<div class="w10p center">' + convertNullValue(data.main_purps_cd, '-', {}) + '</div>';
					const main_purps_cd2 = '<div class="w10p center">' + convertNullValue(data.main_purps_cd2, '-', {}) + '</div>';

			    	const sgg_nm = '<div class="w10p center">'+data.sgg_nm+'</div>';
					const hjd_nm = '<div class="w10p center">' + convertNullValue(data.hjd_nm, '-') + '</div>';
			    	
			    	document.querySelector('#buildPoly-popup .content-div').innerHTML += '<div class="flex">' + id + bldNm + use + qty + pk_area + main_purps_cd + main_purps_cd2 + sgg_nm + hjd_nm + '</div>';
			    }
			    
			    $('#buildPolyNum strong').html('');
			    $('#buildPolyNum strong').append(result.length);
			    
			    $('#weatherPoly-content div').html('');
			    $('.weatherPoly-selected').append("선택영역");
			    $('.weatherPoly-year').append(weatherpoly.year);
				$('.weatherPoly-month').append(month);
			    $('.weatherPoly-day').append(date);
			    $('.weatherPoly-hour').append(weatherpoly.hour);
			    $('.weatherPoly-psfc').append(weatherpoly.psfc+"hpa");
			    //$('.weatherPoly-rain').append(weatherpoly.day);
			    $('.weatherPoly-rh').append(weatherpoly.rh+"%");
			    //$('.weatherPoly-sh2o').append(weatherpoly.sh2o);
			    $('.weatherPoly-smois').append(weatherpoly.smois);
			    $('.weatherPoly-tk').append(weatherpoly.tk+"˚C");
			    $('.weatherPoly-tslb').append(weatherpoly.tslb);
			    $('.weatherPoly-ws').append(weatherpoly.ws);

				document.getElementById('buildPoly-popup').classList.add('on');
			    
				document.getElementById('buildPoly-popup').style.left = ($(window).width()/2) - (document.getElementById('buildPoly-popup').getBoundingClientRect().width/2) + 'px';
				document.getElementById('buildPoly-popup').style.top = ($(window).height()/2) - (document.getElementById('buildPoly-popup').getBoundingClientRect().height/2) + 'px';
				
				$("#buildPoly-popup").draggable();
			}
		}
	});	

}

//엑셀 다운로드

function polyExcelDown(id, title) {
    var tab_text = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
    tab_text = tab_text + '<head><meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">';
    tab_text = tab_text + '<xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>'
    tab_text = tab_text + '<x:Name>Test Sheet</x:Name>';
    tab_text = tab_text + '<x:WorksheetOptions><x:Panes></x:Panes></x:WorksheetOptions></x:ExcelWorksheet>';
    tab_text = tab_text + '</x:ExcelWorksheets></x:ExcelWorkbook></xml></head><body>';
    tab_text = tab_text + "<table border='1px'>";
    var exportTable = $('#' + id).clone();
    exportTable.find('input').each(function (index, elem) { $(elem).remove(); });
    tab_text = tab_text + exportTable.html();
    tab_text = tab_text + '</table></body></html>';
    var data_type = 'data:application/vnd.ms-excel';
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
 
    var fileName = title + '.xls';
    //Explorer 환경에서 다운로드
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
        if (window.navigator.msSaveBlob) {
            var blob = new Blob([tab_text], {
                type: "application/csv;charset=utf-8;"
            });
            navigator.msSaveBlob(blob, fileName);
        }
    } else {
        var blob2 = new Blob([tab_text], {
            type: "application/csv;charset=utf-8;"
        });
        var filename = fileName;
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob2);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}