var BCLS = (function (window, document) {
    var videoTableBody        = document.getElementById('videoTableBody'),
        getPreviousVideos     = document.getElementById('getPreviousVideos'),
        getNextVideos         = document.getElementById('getNextVideos'),
        addCaptions           = document.getElementById('addCaptions'),
        statusMessages        = document.getElementById('statusMessages'),
        totalVideos           = 0,
        totalVideoSets        = 0,
        nextVideoSet          = 0,
        sourceCallNumber      = 0,
        totalDiCalls          = 0,
        currentVideoArray     = [],
        pricePointCount       = 0,

        // placeholder for a collection of checkboxes we'll get later
        eight_hour_checkBoxes,
        twelve_hour_checkBoxes,
        one_day_checkBoxes,
        two_day_checkBoxes,
        three_day_checkBoxes,
        four_day_checkBoxes,

        // place holders for the arrays of selected video ids
        eight_hourVideos      = [],
        twelve_hourVideos     = [],
        one_dayVideos         = [],
        two_dayVideos         = [],
        three_dayVideos       = [],
        four_dayVideos        = [],
        selectedVideos        = [],

        // place holders for the arrays of video URLs
        // NEW
        videoSets = {
            eight_hourVideosURLs: [],
            twelve_hourVideosURLs: [],
            one_dayVideosURLs: [],
            two_dayVideosURLs: [],
            three_dayVideosURLs: [],
            four_dayVideosURLs: []
        },
        // NEW
        videoSetList = ['eight_hourVideosURLs', 'twelve_hourVideosURLs', 'one_dayVideosURLs', 'two_dayVideosURLs', 'three_dayVideosURLs', 'four_dayVideosURLs'],
        videoSetNumber = 0,
        /**
         * this is for a multi-user environment
         * with multiple accounts, I'm simulating
         * user/account information obtained from some backend system
         */
        customer_id           = 'customer1',
        brightcoveAccountId   = '5194481801001';
        pricePoints           = ['8_hour', '12_hour', '1_day', '2_day', '3_day', '4_day'];

    /**
     * event listeners
     */
    window.addEventListener('load', function() {
        // get the video count and load the first set immediately
        disableButton(getPreviousVideos);
        createRequest('getVideoCount');
        createRequest('getVideos');
    });
    // get next set of videos
    getNextVideos.addEventListener('click', function () {
        // get the next video set
        statusMessages.textContent = '';
        enableButton(getPreviousVideos);
        nextVideoSet++;
        if (nextVideoSet === (totalVideoSets - 1)) {
            disableButton(getNextVideos);
        }
        createRequest('getVideos');
    });
    // get previous set of videos
    getPreviousVideos.addEventListener('click', function () {
        // get the next video set
        statusMessages.textContent = '';
        enableButton(getNextVideos);
        nextVideoSet--;
        if (nextVideoSet === 0) {
            disableButton(getPreviousVideos);
        }
        createRequest('getVideos');
    });
    // add captions to selected videos
    addCaptions.addEventListener('click', function() {
        var i, iMax;
        // create video groups based on price point
        eight_hourVideos  = getSelectedCheckboxes(eight_hour_checkBoxes, eight_hourVideos);
        twelve_hourVideos = getSelectedCheckboxes(twelve_hour_checkBoxes, twelve_hourVideos);
        one_dayVideos     = getSelectedCheckboxes(one_day_checkBoxes, one_dayVideos);
        two_dayVideos     = getSelectedCheckboxes(two_day_checkBoxes, two_dayVideos);
        three_dayVideos   = getSelectedCheckboxes(three_day_checkBoxes, three_dayVideos);
        four_dayVideos    = getSelectedCheckboxes(four_day_checkBoxes, four_dayVideos);
        // selectedVideos = eight_hourVideos.concat(twelve_hourVideos, one_dayVideos, two_dayVideos, three_dayVideos, four_dayVideos);
        console.log('eight_hourVideos', eight_hourVideos);
        console.log('twelve_hourVideos', twelve_hourVideos);
        console.log('one_dayVideos', one_dayVideos);
        console.log('two_dayVideos', two_dayVideos);
        console.log('three_dayVideos', three_dayVideos);
        console.log('four_dayVideos', four_dayVideos);
        //  now get sources to handoff to Vantage
        // we'll do this by the pricePoints
        getSources(pricePoints[pricePointCount]);

    });

    /**
     * getSelectedCheckboxes returns an array of the values
     * of checked checkboxes
     * @param {htmlElementCollection} checkboxCollection a collection of the checkbox elements, usually gotten by document.getElementsByName()
     * @param {Array} targetArray the array to store the values in
     * @returns {Array} the target array
     */
    function getSelectedCheckboxes(checkboxCollection, targetArray) {
        var i,
            iMax = checkboxCollection.length;
        for (i = 0; i < iMax; i += 1) {
            if (checkboxCollection[i].checked) {
                targetArray.push(checkboxCollection[i].value);
            }
        }
        return targetArray;
    }

    /**
    * Enable a button
    * @param {htmlElement} el the button
    */
    function enableButton(el) {
        el.removeAttribute('disabled');
        el.setAttribute('style', 'cursor:pointer;opacity:1;');
    }

    /**
    * Disable a button
    * @param {htmlElement} el the button
    */
    function disableButton(el) {
        el.setAttribute('disabled', 'disabled');
        el.setAttribute('style', 'cursor:not-allowed;opacity:.7;');
    }

    /**
     * selects all checkboxes in a collection
     * of checked checkboxes
     * @param {htmlElementCollection} checkboxCollection a collection of the checkbox elements, usually gotten by document.getElementsByName()
     */
    function selectAllCheckboxes(checkboxCollection) {
        var i,
            iMax = checkboxCollection.length;
        for (i = 0; i < iMax; i += 1) {
            checkboxCollection[i].setAttribute('checked', 'checked');
        }
    }

    /**
     * deselects all checkboxes in a collection
     * of checked checkboxes
     * @param {htmlElementCollection} checkboxCollection a collection of the checkbox elements, usually gotten by document.getElementsByName()
     */
    function deselectAllCheckboxes(checkboxCollection) {
        var i,
            iMax = checkboxCollection.length;
        for (i = 0; i < iMax; i += 1) {
            checkboxCollection[i].removeAttribute('checked');
        }
    }

    /**
     * sort an array of objects based on an object property
     * @param {array} targetArray - array to be sorted
     * @param {string|number} objProperty - object property to sort on
     * @return {array} sorted array
     */
    function sortArray(targetArray, objProperty) {
        targetArray.sort(function (a, b) {
            var propA = a[objProperty], propB = b[objProperty];
            // sort ascending; reverse propA and propB to sort descending
            if (propA < propB) {
                 return -1;
            } else if (propA > propB) {
                 return 1;
            } else {
                 return 0;
            }
        });
        return targetArray;
    }

    /**
     * Gets an array of source objects for a set of video ids
     * @param {string} pricePoint the pricePoint (from the pricePoints array)
     * @return {array} array of source objects in the form {video_id: srcURL}
     */
    function getSources(pricePoint) {
        var i,
            iMax,
            url,
            tmpArray = [],
            tmpObj = {};

        switch (pricePoint) {
            case '8_hour':
                if (eight_hourVideos.length > 0) {
                    currentVideoArray = eight_hourVideos;
                    createRequest('getSource', function(url) {
                        if (url) {
                            tmpObj[currentVideoArray[sourceCallNumber]] = url;
                            eight_hourVideosURLs.push(tmpObj);
                        }
                        sourceCallNumber++;
                        if (sourceCallNumber < currentVideoArray.length) {
                            getSources(pricePoints[pricePointCount]);
                        } else {
                            pricePointCount++;
                            sourceCallNumber = 0;
                            getSources(pricePoints[pricePointCount]);
                        }
                    });
                } else {
                    pricePointCount++;
                    sourceCallNumber = 0;
                    getSources(pricePoints[pricePointCount]);
                }
                break;
            case '12_hour':
                if (twelve_hourVideos.length > 0) {
                    currentVideoArray = twelve_hourVideos;
                    createRequest('getSource', function(url) {
                        if (url) {
                            tmpObj[currentVideoArray[sourceCallNumber]] = url;
                            twelve_hourVideosURLs.push(tmpObj);
                        }
                        sourceCallNumber++;
                        if (sourceCallNumber < currentVideoArray.length) {
                            getSources(pricePoints[pricePointCount]);
                        } else {
                            pricePointCount++;
                            sourceCallNumber = 0;
                            getSources(pricePoints[pricePointCount]);
                        }
                    });
                } else {
                    pricePointCount++;
                    sourceCallNumber = 0;
                    getSources(pricePoints[pricePointCount]);
                }
                break;
            case '1_day':
                if (one_dayVideos.length > 0) {
                    currentVideoArray = one_dayVideos;
                    createRequest('getSource', function(url) {
                        if (url) {
                            tmpObj[currentVideoArray[sourceCallNumber]] = url;
                            one_dayVideosURLs.push(tmpObj);
                        }
                        sourceCallNumber++;
                        if (sourceCallNumber < currentVideoArray.length) {
                            getSources(pricePoints[pricePointCount]);
                        } else {
                            pricePointCount++;
                            sourceCallNumber = 0;
                            getSources(pricePoints[pricePointCount]);
                        }
                    });
                } else {
                    pricePointCount++;
                    sourceCallNumber = 0;
                    getSources(pricePoints[pricePointCount]);
                }
                break;
            case '2_day':
                if (two_dayVideos.length > 0) {
                    currentVideoArray = two_dayVideos;
                    createRequest('getSource', function(url) {
                        if (url) {
                            tmpObj[currentVideoArray[sourceCallNumber]] = url;
                            two_dayVideosURLs.push(tmpObj);
                        }
                        sourceCallNumber++;
                        if (sourceCallNumber < currentVideoArray.length) {
                            getSources(pricePoints[pricePointCount]);
                        } else {
                            pricePointCount++;
                            sourceCallNumber = 0;
                            getSources(pricePoints[pricePointCount]);
                        }
                    });
                } else {
                    pricePointCount++;
                    sourceCallNumber = 0;
                    getSources(pricePoints[pricePointCount]);
                }
                break;
            case '3_day':
                if (three_dayVideos.length > 0) {
                    currentVideoArray = three_dayVideos;
                    createRequest('getSource', function(url) {
                        if (url) {
                            tmpObj[currentVideoArray[sourceCallNumber]] = url;
                            three_dayVideosURLs.push(tmpObj);
                        }
                        sourceCallNumber++;
                        if (sourceCallNumber < currentVideoArray.length) {
                            getSources(pricePoints[pricePointCount]);
                        } else {
                            pricePointCount++;
                            sourceCallNumber = 0;
                            getSources(pricePoints[pricePointCount]);
                        }
                    });
                } else {
                    pricePointCount++;
                    sourceCallNumber = 0;
                    getSources(pricePoints[pricePointCount]);
                }
                break;
            case '4_day':
                if (four_dayVideos.length > 0) {
                    currentVideoArray = four_dayVideos;
                    createRequest('getSource', function(url) {
                        if (url) {
                            tmpObj[currentVideoArray[sourceCallNumber]] = url;
                            four_dayVideosURLs.push(tmpObj);
                        }
                        sourceCallNumber++;
                        if (sourceCallNumber < currentVideoArray.length) {
                            getSources(pricePoints[pricePointCount]);
                        } else {
                            statusMessages.textContent = 'Captions request submitted';
                            deselectAllCheckboxes(eight_hour_checkBoxes);
                            deselectAllCheckboxes(twelve_hour_checkBoxes);
                            deselectAllCheckboxes(one_day_checkBoxes);
                            deselectAllCheckboxes(two_day_checkBoxes);
                            deselectAllCheckboxes(three_day_checkBoxes);
                            deselectAllCheckboxes(four_day_checkBoxes);
                            console.log('videoSets', videoSets);
                            // the six arrays above are what need to get passed to a server-side
                            // app to get the videos and move them to the Vantage folderseight_hourVideosURLs);
                        }
                    });
                } else {
                    statusMessages.textContent = 'Captions request submitted';
                    deselectAllCheckboxes(eight_hour_checkBoxes);
                    deselectAllCheckboxes(twelve_hour_checkBoxes);
                    deselectAllCheckboxes(one_day_checkBoxes);
                    deselectAllCheckboxes(two_day_checkBoxes);
                    deselectAllCheckboxes(three_day_checkBoxes);
                    deselectAllCheckboxes(four_day_checkBoxes);
                    // NEW
                    getVideoFiles();
                }
                break;
            default:
                // should never get here
                console.log('Invalid pricepoint');
                break;
        }
    }
    // NEW
    /**
     * initiates sending file lists to get files
     * @return {[type]} [description]
     */
    function getVideoFiles() {
        createRequest('getVideoFiles', function () {
            videoSetNumber++;
            if (videoSetNumber < videoSetList) {
                getVideoFiles();
            } else {
                statusMessages.textContent = 'All video file requests submitted';
            }
        });
    }


    /**
     * createRequest sets up requests, send them to makeRequest(), and handles responses
     * @param {string} type the request type
     * @param {function} [callback] callback function
     */
    function createRequest(type, callback) {
        var options    = {},
            cmsBaseURL = 'https://cms.api.brightcove.com/v1/accounts/' + brightcoveAccountId,
            diBaseURL  = 'https://ingest.api.brightcove.com/v1/accounts/' + brightcoveAccountId,
            endpoint,
            responseDecoded,
            limit      = 20,
            track,
            i,
            iMax;

        options.customer_id = customer_id;
        options.account_id  = brightcoveAccountId;
        switch (type) {
            case 'getVideoCount':
                endpoint            = '/counts/videos';
                options.url         = cmsBaseURL + endpoint;
                options.requestType = 'GET';
                makeRequest(options, function(response) {
                    responseDecoded = JSON.parse(response);
                    totalVideos     = parseInt(responseDecoded.count);
                    totalVideoSets  = Math.ceil(totalVideos / limit);
                });
                break;
            case 'getVideos':
                endpoint            = '/videos?limit=' + limit + '&offset=' + (nextVideoSet * limit);
                options.url         = cmsBaseURL + endpoint;
                options.requestType = 'GET';
                makeRequest(options, function(response) {
                    var video,
                        tr,
                        td,
                        br,
                        input,
                        label,
                        img,
                        txt,
                        j,
                        docFragment = document.createDocumentFragment();
                    // parse the response
                    responseDecoded = JSON.parse(response);
                    // inject the table rows for the videos
                    iMax = responseDecoded.length;
                    for (i = 0; i < iMax; i++) {
                        video = responseDecoded[i];
                        if (video.id) {
                            tr = document.createElement('tr');
                            // checkbox cell
                            td = document.createElement('td');
                            for (j = 0; j < pricePoints.length; j++) {
                                input = document.createElement('input');
                                input.setAttribute('type', 'checkbox');
                                input.setAttribute('id', pricePoints[j] + '_check_' + j);
                                input.setAttribute('name', pricePoints[j]);
                                input.setAttribute('value', video.id);
                                td.appendChild(input);
                                label = document.createElement('label');
                                label.setAttribute('for', pricePoints[j] + '_check_' + j);
                                txt = document.createTextNode(pricePoints[j]);
                                label.appendChild(txt);
                                td.appendChild(label);
                                br = document.createElement('br');
                                td.appendChild(br);
                                td.setAttribute('style', 'min-width:100px;');
                            }
                            tr.appendChild(td);

                            // thumbnail cell
                            if (video.images && video.images.thumbnail) {
                                td = document.createElement('td');
                                img = document.createElement('img');
                                img.setAttribute('src', video.images.thumbnail.src);
                                img.setAttribute('alt', video.name);
                                td.appendChild(img);
                                tr.appendChild(td);
                            } else {
                                td = document.createElement('td');
                                txt = document.createTextNode('(no image)');
                                td.appendChild(txt);
                                tr.appendChild(td);
                            }
                            // add title cell
                            td = document.createElement('td');
                            txt = document.createTextNode(video.name);
                            td.appendChild(txt);
                            br = document.createElement('br');
                            td.appendChild(br);
                            txt = document.createTextNode(video.description);
                            td.appendChild(txt);
                            tr.appendChild(td);
                            // append this row to the doc fragment
                            docFragment.appendChild(tr);
                        }
                    }
                    // clear the table body and append the doc fragment to the table body
                    videoTableBody.innerHTML = '';
                    videoTableBody.appendChild(docFragment);
                    // get a reference to the checkbox collection
                    eight_hour_checkBoxes = document.getElementsByName('8_hour');
                    twelve_hour_checkBoxes = document.getElementsByName('12_hour');
                    one_day_checkBoxes = document.getElementsByName('1_day');
                    two_day_checkBoxes = document.getElementsByName('2_day');
                    three_day_checkBoxes = document.getElementsByName('3_day');
                    four_day_checkBoxes = document.getElementsByName('4_day');

                });
                break;
            case 'getSource':
                endpoint            = '/videos/' + currentVideoArray[sourceCallNumber] + '/sources';
                options.url         = cmsBaseURL + endpoint;
                options.requestType = 'GET';


                makeRequest(options, function(response) {
                    if (response) {
                        var tmpArray = [];
                        responseDecoded = JSON.parse(response);
                        iMax = responseDecoded.length;
                        // remove sources that are not downloadable MP4
                        for (i = 0; i < iMax; i++) {
                            if (responseDecoded[i]) {
                                if (responseDecoded[i].hasOwnProperty('container') && responseDecoded[i].container === 'MP4' && responseDecoded[i].hasOwnProperty('src')) {
                                    tmpArray.push(responseDecoded[i]);
                                }
                            }
                        }
                        if (tmpArray.length > 0) {
                            // sort the array
                            responseDecoded = sortArray(tmpArray,'encoding_rate');
                            // return the best rendition
                            callback(responseDecoded[tmpArray.length - 1].src);
                        } else {
                            console.log('The video ' + currentVideoArray[sourceCallNumber] + ' has no downloadable rendition');
                            callback(null);
                        }
                    }
                });
                break;
            // NEW
            case 'getVideoFiles':
                // change the name below to whatever you named the PHP file
                options.proxyURL = 'videos-APIdownload.php';
                options.requestData = JSON.stringify(videoSets[videoSetList[videoSetNumber]]);
                options.requestType = 'GET';
                options.url = null;
                makeRequest(options, function () {
                    // when done callback to move on
                    callback();
                });
                break;
            default:
                //shouldn't be here
                console.log('Invalid request type');
        }
    }


    /**
     * send API request to the proxy
     * @param  {Object} options for the request
     * @param  {String} options.url the full API request URL
     * @param  {String="GET","POST","PATCH","PUT","DELETE"} requestData [options.requestType="GET"] HTTP type for the request
     * @param  {String} options.account_id the account id
     * @param  {JSON} [options.requestBody] Data to be sent in the request body in the form of a JSON string
     * @param  {Function} [callback] callback function that will process the response
     */
    function makeRequest(options, callback) {
        var httpRequest = new XMLHttpRequest(),
            response,
            requestParams,
            dataString,
            proxyURL = 'videos-proxy.php',
            // response handler
            getResponse = function() {
                try {
                    if (httpRequest.readyState === 4) {
                        if (httpRequest.status === 200) {
                            response = httpRequest.responseText;
                            // some API requests return '{null}' for empty responses - breaks JSON.parse
                            if (response === '{null}') {
                                response = null;
                            }
                            // return the response
                            callback(response);
                        } else {
                            console.log('There was a problem with the request. Request returned ' + httpRequest.status);
                        }
                    }
                } catch (e) {
                    console.log('Caught Exception: ' + e);
                }
            };
        /**
         * set up request data
         * the proxy used here takes the following params:
         * options.url - the full API request (required)
         * options.account_id - the account id
         * options.requestType - the HTTP request type (default: GET)
         * options.client_id - the client id (defaults here to a Brightcove sample account value - this should always be stored on the server side if possible)
         * options.client_secret - the client secret (defaults here to a Brightcove sample account value - this should always be stored on the server side if possible)
         * options.requestBody - request body for write requests (optional JSON string)
         */

        // NEW
        requestParams = 'requestType=' + options.requestType + '&account_id=' + options.account_id + '&customer_id=' + options.customer_id;
        // if url for api request
        if (options.url) {
            requestParams += '&url=' + encodeURIComponent(options.url);
        }


        // only add client id and secret if both were submitted
        if (options.client_id && options.client_secret) {
            requestParams += '&client_id=' + options.client_id + '&client_secret=' + options.client_secret;
        }
        // add request data if any
        if (options.requestBody) {
            requestParams += '&requestBody=' + encodeURIComponent(options.requestBody);
        }

        // set response handler
        httpRequest.onreadystatechange = getResponse;

        // open the request
        httpRequest.open('POST', proxyURL);

        // set headers
        httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        // open and send request
        httpRequest.send(requestParams);
    }


})(window, document);
