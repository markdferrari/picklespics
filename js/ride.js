/*global PicklesPics _config*/

var PicklesPics = window.PicklesPics || {};
PicklesPics.map = PicklesPics.map || {};

(function rideScopeWrapper($) {
    var authToken;
    PicklesPics.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });
    function requestUnicorn(pickupLocation) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/ride',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                PickupLocation: {
                    Latitude: pickupLocation.latitude,
                    Longitude: pickupLocation.longitude
                }
            }),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(result) {
        var unicorn;
        var pronoun;
        console.log('Response received from API: ', result);
        unicorn = result.Unicorn;
        pronoun = unicorn.Gender === 'Male' ? 'his' : 'her';
        displayUpdate(unicorn.Name + ', your ' + unicorn.Color + ' unicorn, is on ' + pronoun + ' way.');
        animateArrival(function animateCallback() {
            displayUpdate(unicorn.Name + ' has arrived. Giddy up!');
            PicklesPics.map.unsetLocation();
            $('#request').prop('disabled', 'disabled');
            $('#request').text('Set Pickup');
        });
    }

    // Register click handler for #request button
    $(function onDocReady() {
        $('#request').click(handleRequestClick);
        $(PicklesPics.map).on('pickupChange', handlePickupChanged);

        PicklesPics.authToken.then(function updateAuthMessage(token) {
            if (token) {
                displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                $('.authToken').text(token);
            }
        });

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
    });

    function handlePickupChanged() {
        var requestButton = $('#request');
        requestButton.text('Request Unicorn');
        requestButton.prop('disabled', false);
    }

    function handleRequestClick(event) {
        var pickupLocation = PicklesPics.map.selectedPoint;
        event.preventDefault();
        requestUnicorn(pickupLocation);
    }

    function animateArrival(callback) {
        var dest = PicklesPics.map.selectedPoint;
        var origin = {};

        if (dest.latitude > PicklesPics.map.center.latitude) {
            origin.latitude = PicklesPics.map.extent.minLat;
        } else {
            origin.latitude = PicklesPics.map.extent.maxLat;
        }

        if (dest.longitude > PicklesPics.map.center.longitude) {
            origin.longitude = PicklesPics.map.extent.minLng;
        } else {
            origin.longitude = PicklesPics.map.extent.maxLng;
        }

        PicklesPics.map.animate(origin, dest, callback);
    }

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));
