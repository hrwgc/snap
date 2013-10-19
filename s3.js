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
  document.getElementById('h1').innerHTML = 'Index of ' + location.href;
  $.get(url)
    .done(function(data) {
      var xml = $(data);
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


function renderTable(files) {
  var cols = [ 55, 45, 15 ];
  var content = '';
  var first_subdir = true;
  var snaps = $.grep(files, function(f) {
    return f.Key.split('/')[0] === "native";
   });
  console.log(snaps)
  $.each(snaps, function(idx, item) {
    var key = item.Key.split('/')[1].split('.')[0]
    var row = '';
    row += '<a href="' + url + '/index.html?path=' + 'native/' + key + '.png"><img src="'  +  url + '/crop/256/' + key + '.jpg" /><pre><code>' + key + '</pre></code></a>';
    content += row;
 
  });
  document.getElementById('listing').innerHTML = '<pre>' + content + '</pre>';
}


