#!/bin/bash
bucket="mapbox-blog-testing";
index='snap-index'
md5tool='md5 -p'

function setup(){
    if [ `uname` == "Linux" ];
    then
        export md5tool=md5sum
    fi
}

function usage(){
  echo -e "usage:\n ./upload image.png";
}

setup

if [[ -z $1 ]]; then usage; exit 1; fi



### check for all dependencies

function check(){
   if ! which s3cmd > /dev/null; then echo -e "Please run:\n pip install s3cmd"; fi
   if ! which convert > /dev/null; then echo -e "Please run:\n pip install imagemagick"; fi
   if ! which jpegtran > /dev/null; then echo -e "Please run:\n brew install jpeg-turbo"; fi
}

if ! check >/dev/null; then check; exit 1; fi

function size_up(){

    #      generate a bunch of thumbnails and cropped subsets of input images
    img="$1";
    uid=`$md5tool "$img" | awk '{print $1}'`
    mkdir -p $uid;

    ext=`echo "$img" | awk -F'.' '{ print $NF }'`
    echo "" > $uid/$uid;
    s3cmd put -P --no-progress $uid/$uid s3://${index}/photos/ >/dev/null;

    s3cmd put -P --no-progress "$img" s3://${bucket}/native/$uid.${ext} >/dev/null;

    for res in 75 150 240 320 500 640 800 1024 1280; do
            convert -resize ${res}x "$img" $uid/${uid}_${res}.jpg >/dev/null;
            jpegtran -copy none -progressive $uid/${uid}_${res}.jpg > $uid/${uid}_${res}-1.jpg ;
            s3cmd put -P --no-progress $uid/${uid}_${res}-1.jpg s3://${bucket}/$res/${uid}.jpg >/dev/null;
    done
    convert -gravity Center -crop 1024x1024+0+0 "$img" $uid/${uid}_1024.jpg >/dev/null;
    convert -resize 512x512 $uid/${uid}_1024.jpg $uid/${uid}_512.jpg >/dev/null;
    convert -resize 256x256 $uid/${uid}_1024.jpg $uid/${uid}_256.jpg >/dev/null;
    convert -resize 128x128 $uid/${uid}_1024.jpg $uid/${uid}_128.jpg >/dev/null;

    for res in 128 256 512; do
            jpegtran -copy none -progressive $uid/${uid}_${res}.jpg > $uid/${uid}_${res}-1.jpg ;
            s3cmd put -P --no-progress $uid/${uid}_${res}-1.jpg s3://${bucket}/crop/$res/${uid}.jpg >/dev/null;
    done
    rm -rf $uid;
}

function delete(){
    uid="$1"
    for res in 128 256 512; do
       s3cmd del s3://${bucket}/crop/$res/${uid}.jpg >/dev/null;
    done;
    for res in 75 150 240 320 500 640 800 1024 1280; do
        s3cmd del s3://${bucket}/$res/${uid}.jpg >/dev/null;
    done;
    s3cmd del `s3cmd ls s3://$bucket/native/ | grep $uid | head -n 1 | awk '{print $4}'` >/dev/null;
    s3cmd del s3://$index/photos/$uid >/dev/null
}

if [[ -z "$2" ]]; then
    size_up "$1"
elif [[ "$1" == 'del' ]]; then
   delete "$2"
fi
