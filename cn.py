# -----------------------------------------------------------------------------
# SCS Curve Number Generator
# Author: Will Ebby
# -----------------------------------------------------------------------------

 # import tools from WBT module

from WBT.whitebox_tools import WhiteboxTools

# declare a name for the tools

wbt = WhiteboxTools()

# Define the Whitebox working directory
#test Region
wbt.work_dir = "/Volumes/EbbyEHD/BIOL700/wbt_pySpace-master/newHavenAtom"




#variables
lc = "newHavenLCSimple.tif" # Land Cover dataset
ag = "nhAg.tif" # agriculture dataset
hsg = "nhHSG_image.tif" #hydrologic soil group

#burn ag into land Cover

wbt.reclass(
    i = ag,
    output = "01_agReclass.tif",
    reclass_vals = '0;0;10;1',   #new value;oldvalue
    assign_mode=True
)

wbt.add(
    input1 = "01_agReclass.tif",
    input2 = lc,
    output = "02_landCoverwithAg.tif"
)

# Original landcover classes:
# 1: tree canopy
# 2: grass/shrub
# 3: bare soil (often quarries)
# 4: water
# 5: buildings
# 6: roads
# 7: other paved
# 8: railroads

# reclass to simplier land cover
wbt.reclass(
    i = "02_landCoverwithAg.tif",
    output = "landCoverReclass.tif",
    reclass_vals = '3;1;4;2;2;3;1;4;2;5;5;11;5;12;5;13;5;14;5;15', #new value;oldvalue;
    assign_mode=True
)

# Reclassed landcover classes:
# 1: water
# 2: developed
# 3: Tree Canopy
# 4: Grass/shrubs
# 5: Ag

#HSG Soil classes (preprocessed (reclassied and rasterized) in QGIS)
# A: 1
# B: 10
# C: 100
# D: 1000

wbt.multiply(
    input1 = "landCoverReclass.tif",
    input2 = hsg,
    output = "CnUnique.tif"
)

#reclass values based on CN lookup table
wbt.reclass(
    i = "CnUnique.tif",
    output = "CnValues.tif",
    reclass_vals = '100;1;98;2;30;3;39;4;63;5;100;10;98;20;74;30;61;40;75;50;100;100;98;200;82;300;74;400;83;500;100;1000;98;2000;86;3000;80;4000;87;5000',   #new value;oldvalue;
    assign_mode=True
)
