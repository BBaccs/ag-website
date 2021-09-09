$(document).ready(function () {
    sessionStorage.removeItem("locations");
    getLocationData();
    $('#statedd').on('change', function () {
        getLocationData();
    });

    $('#pickupChk').on('click', function (event) {
        if (validateCheckBox(event)) {
            return getLocationData();
        }
        event.preventDefault();
    });

    $('#deliveryChk').on('click', function (event) {
        if (validateCheckBox(event)) {
            return getLocationData();
        }
        event.preventDefault();
    });

    $(document).on('click', '.deliveryBtn', function () {
        buildDeliveryPopup(this);
        $('#deliveryModal').modal('toggle');
    });

    $(document).on('click', '.checkboxRight', function (e) {
        if (validateCheckBox(e)) {
            unCheckBox(this);
            return getLocationData();
        }
        e.preventDefault();
    });

    $(document).on('click', '.checkboxLeft', function (e) {
        if (validateCheckBox(e)) {
            unCheckBox(this);
            return getLocationData();
        }
        e.preventDefault();
    });
});

function validateCheckBox(e) {
    var checkboxes = document.querySelectorAll('.option-filter');
    return checkboxes[0].checked || checkboxes[1].checked;
}

function generateLocationResult(locations) {
    var locationResult = '';
    var groupBystates = _.chain(locations)
        .groupBy("StateName")
        .map(groupCallback)
        .value();
    var sortedGroups = _.sortBy(groupBystates, function (o) { return o.State; });

    $.each(sortedGroups, function (index, values) {
        var template = '';
        var columns = values.Locations.length === 1 ? 'single-column' : 'double-column';
        $.each(values.Locations, function (i, v) {
            var checkListIsOdd = values.Locations.length % 2 === 1;
            if (checkListIsOdd && i === values.Locations.length - 1) {
                template += '<div class="card mx-auto mb-4 odd-column">';
            }
            else {
                template += '<div class="card mx-auto mb-4">';
            }
            //create each location
            template += getLocationTemplate(v);
            template = template.replace('__name__', v.Name);
            template = template.replace('__locationInfo__', v.LocationInfo);
            template = template.replace('__address__', v.Address);
            template = template.replace('__phone__', v.Phone);
            template = template.replace('__pickupURL__', v.PickupURL);
            template = template.replace('__directionsURL__', v.DirectionsURL);
            template = template.replace('__yextURL__', v.YextURL);
            template = template.replace('__menuPdfURL__', v.MenuPdfURL);
            template += '</div>';
        });
        locationResult += '<section><h2 class="landing-heading">' +
            values.State + '</h2><div class="' + columns + '">' + template + '</div></section>';
    });
    return locationResult;
}

function groupCallback(value, key) {
    return { 'State': key, 'Locations': value };
}

function filterLocationsByUserSelection(locations) {
    var hasPickup = $('#pickupChk').prop("checked");
    var hasDelivery = $('#deliveryChk').prop("checked");
    var selectedState = $('#statedd').val();
    if (selectedState.toLowerCase() !== 'all') {
        return _.filter(locations, function (loc) {
            return loc.StateKey === selectedState
                && ((loc.HasPickup === hasPickup) || (loc.HasDelivery === hasDelivery));
        })
    }
    return _.filter(locations, function (loc) {
        return (loc.HasPickup === hasPickup) || (loc.HasDelivery === hasDelivery);
    });
}

function getLocationData() {
    var locations = JSON.parse(sessionStorage.getItem("locations"));
    if (!locations) {
        $.getJSON("../../scripts/locationData.json", function (locationData) {
            if (window.sessionStorage) {
                sessionStorage.setItem("locations", JSON.stringify(locationData));
            }
            loadFilteredLocationDetails(locationData);
        }).fail(function (error) {
            console.log("An error has occurred while loading location data.");
            return null;
        });
    }
    else {
        loadFilteredLocationDetails(locations);
    }
}

function loadFilteredLocationDetails(locations) {
    generateStateDropdown(locations);
    filteredLocations = filterLocationsByUserSelection(locations);
    if (filteredLocations && filteredLocations.length > 0) {
        var locationResult = generateLocationResult(filteredLocations);
        return $('#location-result').html(locationResult);
    }
    searchResultNotFound();
}

function searchResultNotFound() {
    $('#location-result').html('Result not available for selected search criteria.');
}

function generateStateDropdown(locations) {
    var stateList = [];
    var uniqeStateList = _.uniqBy(locations, function (loc) {
        return loc.StateKey;
    });

    $.each(uniqeStateList, function () {
        stateList.push({ 'value': this.StateKey, 'text': this.StateName });
    });

    var sortedList = sortStates(stateList);
    var statedropdown = $("#statedd");
    if ($("#statedd option").length === 1) {
        $.each(sortedList, function () {
            if (this.value === 'FL') {
                statedropdown.append(
                    $('<option class="slim-option" selected></option>').val(this.value).html(this.text)
                );
            }
            else {
                statedropdown.append(
                    $('<option class="slim-option"></option>').val(this.value).html(this.text)
                );
            }
        });
    }
}

function getSelectedLocationByName(list, searchText) {
    return _.find(list, function (o) { return o.Name === searchText });
}

function sortStates(list) {
    return _.sortBy(list, function (o) { return o.value; });
}

function getLocationTemplate(locationData) {
    var template = '<div class="card-body">' +
        '    <h2 class="card-title">__name__</h2>' +
        '    <div class="content-container">' +
        '    <p>__locationInfo__</p>' +
        '    <p class="card-text font-small">__address__</p>' +
        '    <p>__phone__</p>' +
        '    </div>' +
        ' <div class="button-container">';
    if (locationData.HasPickup && locationData.PickupURL) {
        template += '<a  href="__pickupURL__" class="btn btn-primary cta-primary">Pickup</a>';
    }

    if (locationData.HasDelivery && (locationData.Delivery.DoorDashURL || locationData.Delivery.UberEatsURL)) {
        template += '<button data-toggle="modal" class="btn btn-primary cta-primary deliveryBtn" aria-label="Order delivery from ' + locationData.Name + '">Delivery</button>';
    }

    if (locationData.MenuPdfURL) {
        template += '<a href="__menuPdfURL__" target="_blank" class="btn btn-primary cta-primary px-4" aria-label="Open PDF Menu">Menu</a>';
    }

    if (locationData.DirectionsURL) {
        template += '<a href="__directionsURL__" target="_blank" class="btn btn-primary cta-primary">Directions</a>';
    }

    if (locationData.YextURL) {
        template += '<a href="__yextURL__" target="_blank" class="btn btn-primary cta-primary">Learn More</a>';
    }

    return template + '</div></div>';
}

function buildDeliveryPopup(button) {
    var locations = JSON.parse(sessionStorage.getItem("locations"));
    var locationName = $(button).parent().siblings('h2')[0].innerText;
    var selectedLocation = getSelectedLocationByName(locations, locationName);
    var hasDoorDash = selectedLocation.Delivery.DoorDashURL === '' ? false : true;
    var hasUberEats = selectedLocation.Delivery.UberEatsURL === '' ? false : true;

    if (hasDoorDash) {
        var getDoorDashContent = '<a class="d-block" aria-label="Order from Doordash"' +
            'href="___doordashURL___" target="_blank">' +
            '<img class="door-dash-logo" src="../../assets/other/doorDashLogoSmall.jpg"' +
            '   alt="" /> </a>';
        getDoorDashContent = getDoorDashContent.replace('___doordashURL___', selectedLocation.Delivery.DoorDashURL);
        $('#doordash-div').html(getDoorDashContent);
    }
    else {
        $('#doordash-div').html('');
    }

    if (hasDoorDash && hasUberEats) {
        $('#or-separator').show();
    }
    else {
        $('#or-separator').hide();
    }

    if (hasUberEats) {
        var getDoorDashContent = '<a class="d-block" aria-label="Order from Uber Eats"' +
            'href="___ubereatsURL___" target="_blank">' +
            '<img src="../../assets/other/uberEatsLogoSmall.png" alt="" /></a>';
        getDoorDashContent = getDoorDashContent.replace('___ubereatsURL___', selectedLocation.Delivery.UberEatsURL);
        $('#uber-eats-div').html(getDoorDashContent);
    }
    else {
        $('#uber-eats-div').html('');
    }
}

function unCheckBox(checkbox) {
    $(checkbox).toggleClass("checked-option");
}