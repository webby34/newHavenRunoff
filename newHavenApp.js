//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  Author: Will Ebby
//  Purpose: Provide local conservation groups and policymakers with 
//  a GIS-based runoff model and associated raster and vector layers to 
//  make informed decsions to target non-point source pollution 
//  Date updated:   4/18/2022 

//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                              Create side panel 
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// add side panel
var panelSide = ui.Panel({
  style: {
    width: '30%',
  }
});

var map = ui.Map();
map.setOptions('HYBRID');

var splitPanel = ui.SplitPanel({
  firstPanel: map,
  secondPanel: panelSide,
});

// clear root and add split panel
ui.root.clear();
ui.root.add(splitPanel);


//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                             Add Layers from assets
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


var soils = ee.FeatureCollection('users/Webby/NewHaven/nhSoilsClipped');
var soilType = ee.FeatureCollection('users/Webby/NewHaven/nhSoilType');
var nhWatershed = ee.FeatureCollection('users/Webby/NewHaven/newHavenOutline');
var nhImage = ee.Image('users/Webby/NewHaven/NewhavenImage');

var dem = ee.Image('users/Webby/NewHaven/nh10mDEM');
var exaggeration = 1; //can change code here to add exaggeration if desired
var hillshade = ee.Terrain.hillshade(dem.multiply(exaggeration));
var slope = ee.Terrain.slope(dem);

var testdata = ee.FeatureCollection('users/Webby/NewHaven/surveytest');
var turbidity1 = ee.FeatureCollection('users/Webby/NewHaven/turbidity1_withLabels');

//boundaries 

var towns = ee.FeatureCollection('users/Webby/NewHaven/nhTownsOutline');


//Land cover
var lcSimple = ee.Image('users/Webby/NewHaven/10mLC_SAGA');
var lc = ee.Image('users/Webby/NewHaven/5mLC');
var ag = ee.FeatureCollection('users/Webby/NewHaven/agNh');


//water
var nhRiver = ee.FeatureCollection('users/Webby/NewHaven/newHavenRiver');
var nhFlows = ee.FeatureCollection('users/Webby/NewHaven/newHavenFlows');

//CN
var cn = ee.Image('users/Webby/NewHaven/CnNewHavenClipped');


//SCIMAP
var diffuse = ee.Image('users/Webby/NewHaven/diffuse');
var loc = ee.Image('users/Webby/NewHaven/10mLocation');
var deliv = ee.Image('users/Webby/NewHaven/10mDelivery');

//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                             Create layer vis
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//HSG soil vis

var colorTable = ee.Dictionary({ //define color dictions
  'A': '#ffffd4',
  'B': '#fed98e',
  'C': '#fe9929',
  'D': '#cc4c02',

});

//apply color dictionary to Hydrogroup
var styled = soils
  .map(function (feature) {
    return feature.set('style', {
      fillColor: colorTable.get(feature.get('HYDROGROUP'), '777777')
    });
  })
  .style({
    styleProperty: 'style',
  });

//soil type vis

var soilTypeTable = ee.Dictionary({ //define color dictions
  'A': '#ffffd4',
  'B': '#fed98e',
  'C': '#fe9929',
  'D': '#cc4c02',

});

//apply color dictionary to Hydrogroup
var soilTypeStyled = soilType
  .map(function (feature) {
    return feature.set('style', {
      fillColor: colorTable.get(feature.get('MUSYM'), '777777')
    });
  })
  .style({
    styleProperty: 'style',
  });
  
var turbidTable = ee.Dictionary({ //define color dictions
  'MB': '#0000ff',
  'DS': '#FF0000',
  'US': '#FFFF00',
  'HW': '#00FF00'

});

//apply color dictionary to points
var dataStyled = turbidity1
  .map(function (feature) {
    return feature.set('style', {
      fillColor: turbidTable.get(feature.get('site'), '777777')
    });
  })
  .style({
    styleProperty: 'style',
  });


//RGB images 
var NC = {
  bands: ['b1', 'b2', 'b3'], 
  gamma: 1
};

var mask = nhImage.eq(1); //create mask to hide white outside of SAGA RGB images

//town vis
var Townvis_params = {
    'color': 'black', 
    'lineType': 'dashed',
    'fillColor': '00000000',
    'width': 8
};

//watershed vis

var watershedvis_params = {
    'color': 'blue', 
    'lineType': 'dotted',
    'fillColor': '00000000',
};


/// DEM HYPSO

var hsVis = { //set visualisation parameters
  min:100, //set min
  max:255, //set max
  palette: ['black', 'white'] //set color palette, shade=black direct sunlight=white
}
;

var hypVis = {
  min:0, //set min
  max:4000, //set max
  opacity:0.7, //set opacity
  palette: ['548e5c', 'c4c988', 'b29d74', 'ffffff'] //define colors
};


//Land cover

var lcSimplePal = [
  ' #FF0000',
  '#9cd3db',
  '#228B22',
  ' #dcca98',
  '#FFBF00'
  ];


var lcVisSimple = {
  min:1,
  max:5,
  palette: lcSimplePal
};

var lcPal = [
  '#228B22',
  ' #dcca98',
  '#836953',
  '#9cd3db',
  '#808080',
  '#000000',
  '#A9A9A9',
  '#6a0dad'
];


var lcVis = {
  min:1,
  max:8,
  palette: lcPal
};

var agVis = {
    'color': '#FFBF00', 
    'lineType': 'solid',
    'fillColor': '00000000',
};


//CN

var cnPal = [
  '#2166ac',
  '#67a9cf',
  '#d1e5f0',
  '#fddbc7',
  '#ef8a62',
  '#b2182b'
];

var cnVis = {
  min: 30,
  max: 100,
  palette: cnPal
};

//slope 

var slopeVis = {
  min:0,
  max:90,
  palette: cnPal
};

//turbid Data

var turbidPal = ['#0000ff', '#FF0000', '#FFFF00', '#00FF00'];


//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                              Add layers to map
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


map.centerObject(diffuse, 11);

//Base layers
map.addLayer(hillshade, hsVis, "Hillshade", 1, 1); //0
map.addLayer(dem, hypVis, 'Hypsometric Tint', 0); //1
map.addLayer(lcSimple, lcVisSimple, 'Simplified Land Cover 10m', 0, 1); //2
map.addLayer(lc.updateMask(mask), lcVis, '2016 Land Cover',0,1); //3
map.addLayer(ag,agVis, 'Agriculture', 0, 0.66); //4
map.addLayer(towns, Townvis_params, 'Town Boundaries', 0,0.6); //5 //****TOWNS MIGHT NEED TO BE ON TOP 
//Soils
map.addLayer(styled, null, "Hydrologic Soil Group ", 0,1); //6
map.addLayer(styled, null, "Hydrologic Soil Group ", 0,1); //placeholder for soil type //7

//CN
map.addLayer(cn, cnVis, 'SCS Curve Number',0,1); //8

//SCIMAP Outputs
map.addLayer(loc.updateMask(mask), NC, "Locational Risk", 0, 1); //9
map.addLayer(deliv.updateMask(mask), NC, "Delivery Index", 0, 1); //10
map.addLayer(diffuse.updateMask(mask), NC, "Diffuse Pollution Risk", 1, 0.7); //11

//Water features
map.addLayer(nhWatershed, watershedvis_params, 'New Haven River Watershed', 0, 0.6); //12
map.addLayer(nhFlows, {color: '#0096FF'}, 'New Haven Flowlines',0,1); //13
map.addLayer(nhRiver, {color: '#0096FF'}, 'New Haven River',1,1); //14

map.addLayer(testdata, {color: 'black'}, 'test data', 0, 1);//15
map.addLayer(slope, slopeVis, 'Slope', 0, 1); //16
map.addLayer(dataStyled, null, 'Turbidity Data', 0, 1); //17
map.addLayer(towns, Townvis_params, 'Town Boundaries', 0,0.6); //18
map.addLayer(ag,agVis, 'Agriculture', 0, 0.66); //19


//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                              Create titles and headers
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


var title = ui.Label('Modeling Runoff in the New Haven River Watershed', {fontSize: '25px', fontWeight:'bold', color: '#08457e', textAlign: 'center'});
title.style().set('position', 'top-center');
panelSide.add(title);

var linkText = ui.Label('Modeling Runoff in the New Haven River Watershed', {color:'#0000EE'});
var targetUrl = 'https://webby34.github.io/newHavenRunoff/';
//App summary
var text = ui.Label(
  'This app is designed to allow local conservation groups and policymakers to identify high risk runoff areas in the New Haven River Watershed and create strategies for mitigating sediment-bound non-point source pollution. ' +
  'The Diffuse Pollution Risk layer is an product of the SCIMAP risk mapping model developed by Reaney et al. (2011).'+
  ' This layer identifies high risk areas based on slope, hydrologic connectivity, and land use data.'+
  ' More information about this work and how to use this app can be found here:',
    {fontSize: '15px'});
panelSide.add(text);
panelSide.add(linkText);
linkText.setUrl(targetUrl);


//create line separator 
var intro = ui.Panel([
  ui.Label({
    value: '_____________________________________________________________',
    style: {fontWeight: 'bold',  color: '#08457e'},
  }),
  ui.Label({
    value:'Select layers to display.',
    style: {fontSize: '18px', fontWeight: 'bold'}
  })]);


panelSide.add(intro); //add intro to panel

var runoffTitle = ui.Label({
    value:'Runoff Models',
    style: {fontSize: '15px', fontWeight: 'bold'}
  });


var waterTitle = ui.Label({
    value:'Hydrography',
    style: {fontSize: '15px', fontWeight: 'bold'}
  });

var soilTitle = ui.Label({
    value:'Soil Layers',
    style: {fontSize: '15px', fontWeight: 'bold'}
  });
  
var lcTitle = ui.Label({
    value:'Land Cover',
    style: {fontSize: '15px', fontWeight: 'bold'}
  });  
  
var baseTitle = ui.Label({
    value:'Base Layers',
    style: {fontSize: '15px', fontWeight: 'bold'}
  });
  
var sampleTitle = ui.Label({
  value: 'Field Data',
  style: {fontSize: '15px', fontWeight: 'bold'}
});


//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                              Create legends
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//High/low legend 

// The following creates and styles 1 row of the legend.
var makeRowHighLow = function(color, name) {
 
      // Create the label that is actually the colored box.
      var colorBoxHighLow = ui.Label({
        style: {
          backgroundColor: '#' + color,
          // Use padding to give the box height and width.
          padding: '8px',
          margin: '0 0 4px 22px'
        }
      });
 
      // Create a label with the description text.
      var descriptionHighLow = ui.Label({
        value: name,
        style: {margin: '0 0 4px 6px'}
      });
 
      // Return the panel
      return ui.Panel({
        widgets: [colorBoxHighLow, descriptionHighLow],
        layout: ui.Panel.Layout.Flow('horizontal')
      });
};

//Create a palette using the same colors we used for each extent layer
var paletteMAPHighLow = [
'00FF00',//high
'FF0000',//low
];

// Name of each legend value
var namesHighLow = ['Low','High']; 
 
//create panels for each legend

var highLowLegendPanel = ui.Panel({
  style: {
    width: '80%',
  }
});

var locPanel = ui.Panel({
  style: {
    width: '80%',
  }
});

var diffLegend = ui.Panel({
  style: {
    width: '80%',
  }
});

var redGreenGradient = {
  min: 0 , 
  max : 25,
  palette :['#006837','#1a9850','#66bd63','#a6d96a','#a6d96a','#d9ef8b','#fee08b','#fdae61','#f46d43','#a50026','#d73027']
};



function rgLegend (redGreenGradient) {
  var lon = ee.Image.pixelLonLat().select('longitude');
  var gradient = lon.multiply((redGreenGradient.max-redGreenGradient.min)/100.0).add(redGreenGradient.min);
  var legendImage = gradient.visualize(redGreenGradient);
  
  var thumb = ui.Thumbnail({
    image: legendImage, 
    params: {bbox:'0,0,100,8', dimensions:'150x20'},
    style: {position: 'bottom-center'}
  });
  var panel2 = ui.Panel({
    widgets: [
      ui.Label('Low'), 
      ui.Label({style: {stretch: 'horizontal'}}), 
      ui.Label('High')
    ],
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {stretch: 'horizontal', maxWidth: '180px', padding: '0px 0px 0px 8px'}
  });
  return ui.Panel().add(panel2).add(thumb);
}


diffLegend.add(rgLegend (redGreenGradient));
locPanel.add(rgLegend (redGreenGradient));
highLowLegendPanel.add(rgLegend (redGreenGradient));




// for (var i = 0; i < 2; i++) {
// highLowLegendPanel.add(makeRowHighLow(paletteMAPHighLow[i], namesHighLow[i]));
// }  

// for (var i = 0; i < 2; i++) {
// locPanel.add(makeRowHighLow(paletteMAPHighLow[i], namesHighLow[i]));
// }  

// for (var i = 0; i < 2; i++) {
// diffLegend.add(makeRowHighLow(paletteMAPHighLow[i], namesHighLow[i]));
// }  
highLowLegendPanel.style().set({shown: false}); 
locPanel.style().set({shown: false}); 
diffLegend.style().set({shown: true});
//rgLegend (redGreenGradient).style().set({shown: true});


//Land Cover Legend

// The following creates and styles 1 row of the legend.
var makeRowLC = function(color, name) {
 
      // Create the label that is actually the colored box.
      var colorBoxLC = ui.Label({
        style: {
          backgroundColor: '#' + color,
          // Use padding to give the box height and width.
          padding: '8px',
          margin: '0 0 4px 22px'
        }
      });
 
      // Create a label with the description text.
      var descriptionLC = ui.Label({
        value: name,
        style: {margin: '0 0 10px 6px'}
      });
 
      // Return the panel
      return ui.Panel({
        widgets: [colorBoxLC, descriptionLC],
        layout: ui.Panel.Layout.Flow('horizontal')
      });
};

//Create a palette 
var paletteLC_legend = [
  '228B22',
  'dcca98',
  '836953',
  '9cd3db',
  '808080',
  '000000',
  'A9A9A9',
  '6a0dad'
];



// Name of each legend value
var namesLC = [
  'Tree Canopy', 
  'Grass/Shrub', 
  'Bare Soil', 
  'Water',
  'Building', 
  'Road', 
  'Other Paved Surface',
  'Railroad'
  ]; 
 
var LCLegend = ui.Panel({
  style: {
    width: '80%',
  }
});
for (var i = 0; i < 8; i++) {
LCLegend.add(makeRowLC(paletteLC_legend[i], namesLC[i]));
}  

LCLegend.style().set({shown: false}); 

//Land Cover Simple Legend

// The following creates and styles 1 row of the legend.
var makeRowLCSimple = function(color, name) {
 
      // Create the label that is actually the colored box.
      var colorBoxLCSimple = ui.Label({
        style: {
          backgroundColor: '#' + color,
          // Use padding to give the box height and width.
          padding: '8px',
          margin: '0 0 4px 22px'
        }
      });
 
      // Create a label with the description text.
      var descriptionLCSimple = ui.Label({
        value: name,
        style: {margin: '0 0 10px 6px'}
      });
 
      // Return the panel
      return ui.Panel({
        widgets: [colorBoxLCSimple, descriptionLCSimple],
        layout: ui.Panel.Layout.Flow('horizontal')
      });
};

//Create a palette 
var paletteLC_legendSimple = [
  'FF0000',
  '9cd3db',
  '228B22',
  'dcca98',
  'FFBF00'
  ];


// Name of each legend value
var namesLCSimple = [
  'Developed', 
  'Water', 
  'Tree Canopy', 
  'Grass/Shrub',
  'Agriculture', 
  ]; 
 
var LCLegendSimple = ui.Panel({
  style: {
    width: '80%',
  }
});
for (var i = 0; i < 5; i++) {
LCLegendSimple.add(makeRowLCSimple(paletteLC_legendSimple[i], namesLCSimple[i]));
}  

LCLegendSimple.style().set({shown: false}); 

//HSG legend

// The following creates and styles 1 row of the legend.
var makeRowHSG = function(color, name) {
 
      // Create the label that is actually the colored box.
      var colorBoxHSG = ui.Label({
        style: {
          backgroundColor: '#' + color,
          // Use padding to give the box height and width.
          padding: '8px',
          margin: '0 0 4px 22px'
        }
      });
 
      // Create a label with the description text.
      var descriptionHSG= ui.Label({
        value: name,
        style: {margin: '0 0 10px 6px'}
      });
 
      // Return the panel
      return ui.Panel({
        widgets: [colorBoxHSG, descriptionHSG],
        layout: ui.Panel.Layout.Flow('horizontal')
      });
};

//Create a palette 
var paletteHSG_legend = [
  'ffffd4',
  'fed98e',
  'fe9929',
  'cc4c02'
];

// Name of each legend value
var namesHSG = [
  'A', 
  'B', 
  'C', 
  'D',
  ]; 
 
var HSGLegend = ui.Panel({
  style: {
    width: '80%',
  }
});
for (var i = 0; i < 4; i++) {
HSGLegend.add(makeRowHSG(paletteHSG_legend[i], namesHSG[i]));
}  

HSGLegend.style().set({shown: false}); 

var cnColor = {
  min: 0 , 
  max : 25,
  palette :['#053061','#2166ac','#4393c3','#92c5de','#d1e5f0','#f7f7f7','#fddbc7','#f4a582','#d6604d','#b2182b','#67001f']
};

//CN legend 

var cnLegend = ui.Panel({
  style: {
    width: '100%',
  }
});
function CNLegend (cnColor) {
  var lon = ee.Image.pixelLonLat().select('longitude');
  var gradient = lon.multiply((cnColor.max-cnColor.min)/100.0).add(cnColor.min);
  var legendImage = gradient.visualize(cnColor);
  
  var thumb = ui.Thumbnail({
    image: legendImage, 
    params: {bbox:'0,0,100,8', dimensions:'150x20'},
    style: {position: 'bottom-center'}
  });
  var panel2 = ui.Panel({
    widgets: [
      ui.Label('0'), 
      ui.Label({style: {stretch: 'horizontal'}}), 
      ui.Label('100')
    ],
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {stretch: 'horizontal', maxWidth: '180px', padding: '0px 0px 0px 8px'}
  });
  return ui.Panel().add(panel2).add(thumb);
}
var cnLegendText = ui.Label('A value of 0 represents 100% infiltration while a value of 100 represents 0% infiltration');
cnLegend.add(CNLegend (cnColor));
cnLegend.add(cnLegendText);
cnLegend.style().set({shown: false}); 
var hypLegend = ui.Panel({
  style: {
    width: '80%',
  }
});
hypLegend.style().set({shown: false}); 
var hypColor = {
  min: 0 , 
  max : 25,
  palette :['548e5c', 'c4c988', 'b29d74', 'ffffff']
};

function HypLegend (hypColor) {
  var lon = ee.Image.pixelLonLat().select('longitude');
  var gradient = lon.multiply((hypColor.max-hypColor.min)/100.0).add(hypColor.min);
  var legendImage = gradient.visualize(hypColor);
  
  var thumb = ui.Thumbnail({
    image: legendImage, 
    params: {bbox:'0,0,100,8', dimensions:'150x20'},
    style: {position: 'bottom-center'}
  });
  var panel2 = ui.Panel({
    widgets: [
      ui.Label('224 ft'), 
      ui.Label({style: {stretch: 'horizontal'}}), 
      ui.Label('4,002 ft')
    ],
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {stretch: 'horizontal', maxWidth: '180px', padding: '0px 0px 0px 8px'}
  });
  return ui.Panel().add(panel2).add(thumb);
}
hypLegend.add(HypLegend (hypColor));

//create panels to hold opacity layers for non legend layers
var nhLegend = ui.Panel({
  style: {
    width: '80%',
  }
});

nhLegend.style().set({shown: false}); 

var dataLegend = ui.Panel({
  style: {
    width: '80%',
  }
});

dataLegend.style().set({shown: false}); 

var samplingText = ui.Label({
    value:'Water quality sampling is on-going. Data will be updated as I collect and analyze more data',
    style: {fontSize: '12px',}
  });



//dataLegend.add(samplingText);
var nhFlowLegend = ui.Panel({
  style: {
    width: '80%',
  }
});
nhFlowLegend.style().set({shown: false}); 
var nhwLegend = ui.Panel({
  style: {
    width: '80%',
  }
});
nhwLegend.style().set({shown: false}); 
var AgLegend = ui.Panel({
  style: {
    width: '80%',
  }
});
AgLegend.style().set({shown: false}); 
var townLegend = ui.Panel({
  style: {
    width: '80%',
  }
});
townLegend.style().set({shown: false}); 
var hsLegend = ui.Panel({
  style: {
    width: '80%',
  }
});
hsLegend.style().set({shown: true});

//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                              Create opacity sliders
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var sliderDiffuse = ui.Slider(({style: {width: '200px'}}));

sliderDiffuse.setValue(0.66);

sliderDiffuse.onChange(function(value) {
  map.layers().get(11).setOpacity(value);
  
});

diffLegend.add(sliderDiffuse);

var sliderLoc = ui.Slider(({style: {width: '200px'}}));
sliderLoc.setValue(1);
sliderLoc.onChange(function(value) {
  map.layers().get(9).setOpacity(value);
});
locPanel.add(sliderLoc);

var slider_del= ui.Slider(({style: {width: '200px'}}));
slider_del.setValue(1);
slider_del.onChange(function(value) {
  map.layers().get(10).setOpacity(value);
});
highLowLegendPanel.add(slider_del);

var slider_cn= ui.Slider(({style: {width: '200px'}}));
slider_cn.setValue(1);
slider_cn.onChange(function(value) {
  map.layers().get(8).setOpacity(value);
});
cnLegend.add(slider_cn);

var slider_hsg= ui.Slider(({style: {width: '200px'}}));
slider_hsg.setValue(1);
slider_hsg.onChange(function(value) {
  map.layers().get(6).setOpacity(value);
});
HSGLegend.add(slider_hsg);

var slider_lcSimple= ui.Slider(({style: {width: '200px'}}));
slider_lcSimple.setValue(1);
slider_lcSimple.onChange(function(value) {
  map.layers().get(2).setOpacity(value);
});
LCLegendSimple.add(slider_lcSimple);

var slider_lc= ui.Slider(({style: {width: '200px'}}));
slider_lc.setValue(1);
slider_lc.onChange(function(value) {
  map.layers().get(3).setOpacity(value);
});
LCLegend.add(slider_lc);

var slider_ag= ui.Slider(({style: {width: '200px'}}));
slider_ag.setValue(1);
slider_ag.onChange(function(value) {
  map.layers().get(19).setOpacity(value);
});
AgLegend.add(slider_ag);

var slider_nhf= ui.Slider(({style: {width: '200px'}}));
slider_nhf.setValue(1);
slider_nhf.onChange(function(value) {
  map.layers().get(13).setOpacity(value);
});
nhFlowLegend.add(slider_nhf);

var slider_nhw= ui.Slider(({style: {width: '200px'}}));
slider_nhw.setValue(0.66);
slider_nhw.onChange(function(value) {
  map.layers().get(12).setOpacity(value);
});
nhwLegend.add(slider_nhw);

var slider_nh= ui.Slider(({style: {width: '200px'}}));
slider_nh.setValue(1);
slider_nh.onChange(function(value) {
  map.layers().get(14).setOpacity(value);
});
nhLegend.add(slider_nh);

var slider_town= ui.Slider(({style: {width: '200px'}}));
slider_town.setValue(0.66);
slider_town.onChange(function(value) {
  map.layers().get(18).setOpacity(value);
});
townLegend.add(slider_town);

var slider_hs= ui.Slider(({style: {width: '200px'}}));
slider_hs.setValue(1);
slider_hs.onChange(function(value) {
  map.layers().get(0).setOpacity(value);
});
hsLegend.add(slider_hs);

var slider_hyp= ui.Slider(({style: {width: '200px'}}));
slider_hyp.setValue(0.66);
slider_hyp.onChange(function(value) {
  map.layers().get(1).setOpacity(value);
});
hypLegend.add(slider_hyp);

var slider_hyp= ui.Slider(({style: {width: '200px'}}));
slider_hyp.setValue(0.66);
slider_hyp.onChange(function(value) {
  map.layers().get(1).setOpacity(value);
});
hypLegend.add(slider_hyp);

var slider_data= ui.Slider(({style: {width: '200px'}}));
slider_data.setValue(1);
slider_data.onChange(function(value) {
  map.layers().get(17).setOpacity(value);
});
dataLegend.add(slider_data);

//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                              Create checkboxes and labels
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var checkbox_hs = ui.Checkbox('Hillshade', true);

checkbox_hs.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  map.layers().get(0).setShown(checked);
  hsLegend.style().set('shown', checked);
});

var checkbox_dem = ui.Checkbox('Hypsometric Tint (Elevation)', false);

checkbox_dem.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  map.layers().get(1).setShown(checked);
  hypLegend.style().set('shown', checked);
});

var checkbox_lcSimple = ui.Checkbox('Land Cover Simple (10m)', false);

checkbox_lcSimple.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  map.layers().get(2).setShown(checked);
  LCLegendSimple.style().set('shown', checked);
});

var checkbox_lc= ui.Checkbox('Land Cover 2016 (5m)', false);

checkbox_lc.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  map.layers().get(3).setShown(checked);
  LCLegend.style().set('shown', checked);

});

var checkbox_ag= ui.Checkbox('Agriculture 2016', false);

checkbox_ag.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  map.layers().get(19).setShown(checked);
  AgLegend.style().set('shown', checked);
});

var checkbox_town= ui.Checkbox('Town Boundaries', false);

checkbox_town.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  map.layers().get(18).setShown(checked);
  townLegend.style().set('shown', checked);
});

var checkbox_hsg = ui.Checkbox('Hydrologic Soil Group', false);

checkbox_hsg.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  map.layers().get(6).setShown(checked);
  HSGLegend.style().set('shown', checked);
});

var checkbox_soil = ui.Checkbox('Soil Type', false);

checkbox_soil.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  map.layers().get(7).setShown(checked);
});

var checkbox_cn = ui.Checkbox('SCS Curve Number', false);

checkbox_cn.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  map.layers().get(8).setShown(checked);
  cnLegend.style().set('shown', checked);
});

var checkbox_loc = ui.Checkbox('Locational Risk', false);

checkbox_loc.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  map.layers().get(9).setShown(checked);
  locPanel.style().set('shown', checked);
});

var checkbox_del = ui.Checkbox('Delivery Index', false);

checkbox_del.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  map.layers().get(10).setShown(checked);
  highLowLegendPanel.style().set('shown', checked);
});


var checkbox_diffuse = ui.Checkbox('Diffuse Pollution Risk', true);

checkbox_diffuse.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  map.layers().get(11).setShown(checked);
  diffLegend.style().set('shown', checked);
});

var checkbox_nhwatershed = ui.Checkbox('New Haven Watershed', false);

checkbox_nhwatershed.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  map.layers().get(12).setShown(checked);
  nhwLegend.style().set('shown', checked);
});

var checkbox_nhFlow = ui.Checkbox('New Haven Flowlines', false);

checkbox_nhFlow.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  map.layers().get(13).setShown(checked);
  nhFlowLegend.style().set('shown', checked);
});

var checkbox_nhRiver = ui.Checkbox('New Haven River', true);

checkbox_nhRiver.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  map.layers().get(14).setShown(checked);
  nhLegend.style().set('shown', checked);
});

var checkbox_turbid = ui.Checkbox('Turbidity Data', false);
checkbox_turbid.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  map.layers().get(17).setShown(checked);
  chartPanel.style().set('shown', checked);
  dataLegend.style().set('shown', checked);
});



var feedbackPanel = ui.Panel({
  style: {
    width: '35%',
  }
});

var feedbackText = ui.Label(
  'Feedback or questions?'  +
  ' Email Will Ebby:' +
  ' webby@middlebury.edu',
    {fontSize: '12px'});
feedbackPanel.add(feedbackText);

//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                              Add checkboxes, legends, and sliders to panel
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
panelSide.add(runoffTitle);
panelSide.add(checkbox_diffuse);
panelSide.add(diffLegend);
//panelSide.add(diffLegendTest);
panelSide.add(checkbox_cn);
panelSide.add(cnLegend);
panelSide.add(checkbox_del);
panelSide.add(highLowLegendPanel);
panelSide.add(checkbox_loc);
panelSide.add(locPanel);
panelSide.add(waterTitle);
panelSide.add(checkbox_nhRiver);
panelSide.add(nhLegend);
panelSide.add(checkbox_nhFlow);
panelSide.add(nhFlowLegend);
panelSide.add(checkbox_nhwatershed);
panelSide.add(nhwLegend);
panelSide.add(soilTitle);
//panelSide.add(checkbox_soil);
panelSide.add(checkbox_hsg);
panelSide.add(HSGLegend);
panelSide.add(lcTitle);
panelSide.add(checkbox_lc);
panelSide.add(LCLegend);
panelSide.add(checkbox_lcSimple);
panelSide.add(LCLegendSimple);
panelSide.add(checkbox_ag);
panelSide.add(AgLegend);
panelSide.add(baseTitle);
panelSide.add(checkbox_hs);
panelSide.add(hsLegend);
panelSide.add(checkbox_dem);
panelSide.add(hypLegend);
panelSide.add(checkbox_town);
panelSide.add(townLegend);
panelSide.add(sampleTitle);
panelSide.add(checkbox_turbid);
panelSide.add(dataLegend);
panelSide.add(feedbackPanel);




var tubidity = turbidity1.select('turbiditysite');
var site = turbidity1.select('site');

var chart =
    ui.Chart.feature
        .byFeature({
          features: turbidity1.select('turbidity|site'),
          xProperty: 'site',
        });

chart.setChartType('ColumnChart');
chart.setOptions({
title: 'Turbidity Levels',
legend: {position: 'none'},
hAxis: {title: 'Site'},
//colors: ['blue', 'red', 'yellow', 'green'],
vAxis: {title: 'Turbidity (NTU)'}
});


 
//print(chart);

var chartPanel = ui.Panel({
  style: {
    width: '20%',
  }
});
chartPanel.style().set({
  width: '300px',
  position: 'top-left',
  
});

chartPanel.add(chart);
chartPanel.style().set({shown: false});
map.add(chartPanel);
//chartPanel.add(samplingText);
