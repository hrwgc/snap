var loc;
var url;
jQuery(function($) {

  if (typeof BUCKET_URL != 'undefined') {
    url = BUCKET_URL;
  } else {
    url = location.protocol + '//' + location.hostname;
    console.log('url : ' + location);
    loc = location;
  }
  url = 'http://mapbox-blog-testing.s3.amazonaws.com'
  // loc = ''

  // document.getElementById('h1').innerHTML = 'Index of ' + location.href;
  index = 'http://snap-index.s3.amazonaws.com'

  $.get(index)
    .done(function(data) {
      var xml = $(data);
      //console.log(xml)

      var files = $.map(xml.find('Contents'), function(item) {
        item = $(item);
        return {
          Key: item.find('Key').text(),
          LastModified: item.find('LastModified').text(),
          Size: item.find('Size').text(),
        }
      });
      renderTable(files);
    })
    .fail(function(error) {
      alert('There was an error');
      console.log(error);
    });



});
function preview(id){
  var sizes = [75, 150, 240, 320, 500, 640, 800, 1024, 1280, 'native']
  var crop = [128, 256, 512]

  var list = document.getElementById('listing');
  list.innerHTML = '';
  var content = document.createElement('div');
  content.className = 'col12 pad4 dark'
  content.innerHTML = '<a class="thumb" href="#' 
        + id 
        + '"><img src="'  
        +  url 
        + '/640/' 
        + id
        + '.jpg" /></a>';
  list.appendChild(content);

  for (var i=0;i<sizes.length;i++){
    var row = document.createElement('pre');
    row.innerHTML = '<code>' 
        +  url 
        + '/' 
        + sizes[i] 
        + '/' 
        + id 
        + '.jpg</code>';
    content.appendChild(row);
  }

}


function renderTable(files) {
  var cols = [ 55, 45, 15 ];
  var content = document.getElementById('listing');
  content.innerHTML = ''
  var first_subdir = true;
  var snaps = $.grep(files, function(f) {
    return f.Key.split('/')[0] === "photos";
   });
  $.each(snaps, function(idx, item) {
    var key = item.Key.split('/')[1].split('.')[0]
    var row = '';
    var thumb = document.createElement('a');
    thumb.className = 'thumb col4 pad2';
    thumb.setAttribute('href', "#" + key);
    thumb.innerHTML = '<img src="'  +  url + '/crop/256/' + key + '.jpg" /><code>' + key + '</code>';
    thumb.onclick = function(){
         var uid = $(this)[0].hash.split('#')[1];
         preview(uid);
    };
    content.appendChild(thumb);
  });
}


