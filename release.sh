
# build source
webpack

# setup release dir
rm -r release
rm -r labellayer.tar.gz
mkdir -p release/labellayer/dist

# cope relevant dirs
cp LabelLayer.js release/labellayer/LabelLayer.js
cp index.html release/labellayer/index.html
cp dist/LabelLayer.js release/labellayer/dist/LabelLayer.js
cp -R data release/labellayer/data
cp -R lib release/labellayer/data
(
cd release &&
tar -zcvf labellayer.tar.gz labellayer
)


