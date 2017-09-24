var map,
    infowindow,
    listofmarkers = [],
    places = [{
        title: 'Hayward Bart',
        location: {
            lat: 37.6697,
            lng: -122.0870
        }
    }, {
        title: 'Fremont Bart',
        location: {
            lat: 37.5575,
            lng: -121.9766
        }
    }, {
        title: 'Montgomery Bart',
        location: {
            lat: 37.7894,
            lng: -122.4011
        }
    }, {
        title: 'Daly City',
        location: {
            lat: 37.687923,
            lng: -122.470207
        }
    }, {
        title: 'North Berekely',
        location: {
            lat: 37.871853,
            lng: -122.258423
        }
    }];

function initializeMap() {
    var latlng = new google.maps.LatLng(39.305, -76.617);
    map = new google.maps.Map(document.getElementById('map'), {
        center: latlng,
        zoom: 30
    });

    infowindow = new google.maps.InfoWindow();

    var bounds = new google.maps.LatLngBounds();

    places.forEach(function(place, i) {
        var position = place.location;
        var title = place.title;
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            id: i
        });
        listofmarkers.push(marker);
        place.marker = marker;
        var infowindow = new google.maps.InfoWindow();
        marker.addListener('click', function() {
            openInfowindow(this, infowindow);
        });
        bounds.extend(listofmarkers[i].position);
    });

    map.fitBounds(bounds);
    var viewmodel = function() {
        this.listofplaces = ko.observableArray(places);
        this.selectedPlace = ko.observable();
        this.selecctionchangeevent = function() {
            var select = this.selectedPlace();
            console.log(this.selectedPlace());
            if (select) {
                clear();
                select.marker.setVisible(true);
                openInfowindow(select.marker, infowindow);
            } else {
                for (var i = 0; i < places.length; i++) {
                    places[i].marker.setVisible(false);
                }
            }
        };

        this.itemClicked = function(index) {
            var selectedmarker = places[index].marker;
            openInfowindow(selectedmarker, infowindow);
        };
    };

    ko.applyBindings(new viewmodel());
}

function clear() {
    for (var i = 0; i < places.length; i++) {
        places[i].marker.setVisible(false);
    }
    listofmarkers = [];
}

function openInfowindow(marker, infowindow) {
    if (infowindow.marker != marker) {
        var streetviewUrl =
            'http://maps.googleapis.com/maps/api/streetview?size=200x200&location=' + marker.title + '';
        var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
        var content = '<div>' + marker.title + '</div><img src="' + streetviewUrl +
            '"><div id= "wikiElem"></div>';
        infowindow.marker = marker;
        infowindow.setContent(content);
        infowindow.open(map, marker);
        marker.addListener('click', function() {
            map.setCenter(marker.getPosition());
            marker.setAnimation(google.maps.Animation.BOUNCE);
            openInfowindow(marker, infowindow);
        });

        $.ajax({
            url: wikiUrl,
            dataType: "jsonp",
            success: function(response) {
                var articlelist = response[1];
                $wikiElem = $("#wikiElem");
                for (var i = 0; i < articlelist.length; i++) {
                    articlestr = articlelist[i];
                    var url = 'http://en.wikipedia.org/wiki/' + articlestr;
                    $wikiElem.append('<li><a href="' + url + '">' +
                        articlestr + '<a></li>');
                }
            }
        });
    }
}
