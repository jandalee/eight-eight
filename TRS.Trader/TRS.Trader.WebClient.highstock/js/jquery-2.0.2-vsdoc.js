/*
* This file has been generated to support Visual Studio IntelliSense.
* You should not use this file at runtime inside the browser--it is only
* intended to be used only for design-time IntelliSense.  Please use the
* standard jQuery library for all runtime use.
*
* Comment version: 2.0.2
*/

/*!
* jQuery JavaScript Library v2.0.2
* http://jquery.com/
*
* Includes Sizzle.js
* http://sizzlejs.com/
*
* Copyright 2005, 2012 jQuery Foundation, Inc. and other contributors
* Released under the MIT license
* http://jquery.org/license
*
*/

(function (window, undefined) {
    var jQuery = function (selector, context) {
        /// <summary>
        ///     1: Accepts a string containing a CSS selector which is then used to match a set of elements.
        ///     &#10;    1.1 - $(selector, context) 
        ///     &#10;    1.2 - $(element) 
        ///     &#10;    1.3 - $(elementArray) 
        ///     &#10;    1.4 - $(object) 
        ///     &#10;    1.5 - $(jQuery object) 
        ///     &#10;    1.6 - $()
        ///     &#10;2: Creates DOM elements on the fly from the provided string of raw HTML.
        ///     &#10;    2.1 - $(html, ownerDocument) 
        ///     &#10;    2.2 - $(html, attributes)
        ///     &#10;3: Binds a function to be executed when the DOM has finished loading.
        ///     &#10;    3.1 - $(callback)
        /// </summary>
        /// <param name="selector" type="String">
        ///     A string containing a selector expression
        /// </param>
        /// <param name="context" type="">
        ///     A DOM Element, Document, or jQuery to use as context
        /// </param>
        /// <returns type="jQuery" />

        // The jQuery object is actually just the init constructor 'enhanced'
        return new jQuery.fn.init(selector, context, rootjQuery);
    };
    jQuery.Animation = function Animation(elem, properties, options) {

        var result,
            stopped,
            index = 0,
            length = animationPrefilters.length,
            deferred = jQuery.Deferred().always(function () {
                // don't match elem in the :animated selector
                delete tick.elem;
            }),
            tick = function () {
                if (stopped) {
                    return false;
                }
                var currentTime = fxNow || createFxNow(),
                    remaining = Math.max(0, animation.startTime + animation.duration - currentTime),
                    // archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
                    temp = remaining / animation.duration || 0,
                    percent = 1 - temp,
                    index = 0,
                    length = animation.tweens.length;

                for (; index < length ; index++) {
                    animation.tweens[index].run(percent);
                }

                deferred.notifyWith(elem, [animation, percent, remaining]);

                if (percent < 1 && length) {
                    return remaining;
                } else {
                    deferred.resolveWith(elem, [animation]);
                    return false;
                }
            },
            animation = deferred.promise({
                elem: elem,
                props: jQuery.extend({}, properties),
                opts: jQuery.extend(true, { specialEasing: {} }, options),
                originalProperties: properties,
                originalOptions: options,
                startTime: fxNow || createFxNow(),
                duration: options.duration,
                tweens: [],
                createTween: function (prop, end) {
                    var tween = jQuery.Tween(elem, animation.opts, prop, end,
                            animation.opts.specialEasing[prop] || animation.opts.easing);
                    animation.tweens.push(tween);
                    return tween;
                },
                stop: function (gotoEnd) {
                    var index = 0,
                        // if we are going to the end, we want to run all the tweens
                        // otherwise we skip this part
                        length = gotoEnd ? animation.tweens.length : 0;
                    if (stopped) {
                        return this;
                    }
                    stopped = true;
                    for (; index < length ; index++) {
                        animation.tweens[index].run(1);
                    }

                    // resolve when we played the last frame
                    // otherwise, reject
                    if (gotoEnd) {
                        deferred.resolveWith(elem, [animation, gotoEnd]);
                    } else {
                        deferred.rejectWith(elem, [animation, gotoEnd]);
                    }
                    return this;
                }
            }),
            props = animation.props;

        propFilter(props, animation.opts.specialEasing);

        for (; index < length ; index++) {
            result = animationPrefilters[index].call(animation, elem, props, animation.opts);
            if (result) {
                return result;
            }
        }

        createTweens(animation, props);

        if (jQuery.isFunction(animation.opts.start)) {
            animation.opts.start.call(elem, animation);
        }

        jQuery.fx.timer(
            jQuery.extend(tick, {
                elem: elem,
                anim: animation,
                queue: animation.opts.queue
            })
        );

        // attach callbacks from options
        return animation.progress(animation.opts.progress)
            .done(animation.opts.done, animation.opts.complete)
            .fail(animation.opts.fail)
            .always(animation.opts.always);
    };
    jQuery.Callbacks = function (options) {
        /// <summary>
        ///     A multi-purpose callbacks list object that provides a powerful way to manage callback lists.
        /// </summary>
        /// <param name="options" type="String">
        ///     An optional list of space-separated flags that change how the callback list behaves.
        /// </param>
        /// <returns type="Callbacks" />


        // Convert options from String-formatted to Object-formatted if needed
        // (we check in cache first)
        options = typeof options === "string" ?
            (optionsCache[options] || createOptions(options)) :
            jQuery.extend({}, options);

        var // Last fire value (for non-forgettable lists)
            memory,
            // Flag to know if list was already fired
            fired,
            // Flag to know if list is currently firing
            firing,
            // First callback to fire (used internally by add and fireWith)
            firingStart,
            // End of the loop when firing
            firingLength,
            // Index of currently firing callback (modified by remove if needed)
            firingIndex,
            // Actual callback list
            list = [],
            // Stack of fire calls for repeatable lists
            stack = !options.once && [],
            // Fire callbacks
            fire = function (data) {
                memory = options.memory && data;
                fired = true;
                firingIndex = firingStart || 0;
                firingStart = 0;
                firingLength = list.length;
                firing = true;
                for (; list && firingIndex < firingLength; firingIndex++) {
                    if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
                        memory = false; // To prevent further calls using add
                        break;
                    }
                }
                firing = false;
                if (list) {
                    if (stack) {
                        if (stack.length) {
                            fire(stack.shift());
                        }
                    } else if (memory) {
                        list = [];
                    } else {
                        self.disable();
                    }
                }
            },
            // Actual Callbacks object
            self = {
                // Add a callback or a collection of callbacks to the list
                add: function () {
                    if (list) {
                        // First, we save the current length
                        var start = list.length;
                        (function add(args) {
                            jQuery.each(args, function (_, arg) {
                                var type = jQuery.type(arg);
                                if (type === "function") {
                                    if (!options.unique || !self.has(arg)) {
                                        list.push(arg);
                                    }
                                } else if (arg && arg.length && type !== "string") {
                                    // Inspect recursively
                                    add(arg);
                                }
                            });
                        })(arguments);
                        // Do we need to add the callbacks to the
                        // current firing batch?
                        if (firing) {
                            firingLength = list.length;
                            // With memory, if we're not firing then
                            // we should call right away
                        } else if (memory) {
                            firingStart = start;
                            fire(memory);
                        }
                    }
                    return this;
                },
                // Remove a callback from the list
                remove: function () {
                    if (list) {
                        jQuery.each(arguments, function (_, arg) {
                            var index;
                            while ((index = jQuery.inArray(arg, list, index)) > -1) {
                                list.splice(index, 1);
                                // Handle firing indexes
                                if (firing) {
                                    if (index <= firingLength) {
                                        firingLength--;
                                    }
                                    if (index <= firingIndex) {
                                        firingIndex--;
                                    }
                                }
                            }
                        });
                    }
                    return this;
                },
                // Check if a given callback is in the list.
                // If no argument is given, return whether or not list has callbacks attached.
                has: function (fn) {
                    return fn ? jQuery.inArray(fn, list) > -1 : !!(list && list.length);
                },
                // Remove all callbacks from the list
                empty: function () {
                    list = [];
                    firingLength = 0;
                    return this;
                },
                // Have the list do nothing anymore
                disable: function () {
                    list = stack = memory = undefined;
                    return this;
                },
                // Is it disabled?
                disabled: function () {
                    return !list;
                },
                // Lock the list in its current state
                lock: function () {
                    stack = undefined;
                    if (!memory) {
                        self.disable();
                    }
                    return this;
                },
                // Is it locked?
                locked: function () {
                    return !stack;
                },
                // Call all callbacks with the given context and arguments
                fireWith: function (context, args) {
                    args = args || [];
                    args = [context, args.slice ? args.slice() : args];
                    if (list && (!fired || stack)) {
                        if (firing) {
                            stack.push(args);
                        } else {
                            fire(args);
                        }
                    }
                    return this;
                },
                // Call all the callbacks with the given arguments
                fire: function () {
                    self.fireWith(this, arguments);
                    return this;
                },
                // To know if the callbacks have already been called at least once
                fired: function () {
                    return !!fired;
                }
            };

        return self;
    };
    jQuery.Deferred = function (func) {
        /// <summary>
        ///     A constructor function that returns a chainable utility object with methods to register multiple callbacks into callback queues, invoke callback queues, and relay the success or failure state of any synchronous or asynchronous function.
        /// </summary>
        /// <param name="func" type="Function">
        ///     A function that is called just before the constructor returns.
        /// </param>
        /// <returns type="Deferred" />

        var tuples = [
				// action, add listener, listener list, final state
				["resolve", "done", jQuery.Callbacks("once memory"), "resolved"],
				["reject", "fail", jQuery.Callbacks("once memory"), "rejected"],
				["notify", "progress", jQuery.Callbacks("memory")]
        ],
			state = "pending",
			promise = {
			    state: function () {
			        return state;
			    },
			    always: function () {
			        deferred.done(arguments).fail(arguments);
			        return this;
			    },
			    then: function ( /* fnDone, fnFail, fnProgress */) {
			        var fns = arguments;
			        return jQuery.Deferred(function (newDefer) {
			            jQuery.each(tuples, function (i, tuple) {
			                var action = tuple[0],
								fn = jQuery.isFunction(fns[i]) && fns[i];
			                // deferred[ done | fail | progress ] for forwarding actions to newDefer
			                deferred[tuple[1]](function () {
			                    var returned = fn && fn.apply(this, arguments);
			                    if (returned && jQuery.isFunction(returned.promise)) {
			                        returned.promise()
										.done(newDefer.resolve)
										.fail(newDefer.reject)
										.progress(newDefer.notify);
			                    } else {
			                        newDefer[action + "With"](this === promise ? newDefer.promise() : this, fn ? [returned] : arguments);
			                    }
			                });
			            });
			            fns = null;
			        }).promise();
			    },
			    // Get a promise for this deferred
			    // If obj is provided, the promise aspect is added to the object
			    promise: function (obj) {
			        return obj != null ? jQuery.extend(obj, promise) : promise;
			    }
			},
			deferred = {};

        // Keep pipe for back-compat
        promise.pipe = promise.then;

        // Add list-specific methods
        jQuery.each(tuples, function (i, tuple) {
            var list = tuple[2],
				stateString = tuple[3];

            // promise[ done | fail | progress ] = list.add
            promise[tuple[1]] = list.add;

            // Handle state
            if (stateString) {
                list.add(function () {
                    // state = [ resolved | rejected ]
                    state = stateString;

                    // [ reject_list | resolve_list ].disable; progress_list.lock
                }, tuples[i ^ 1][2].disable, tuples[2][2].lock);
            }

            // deferred[ resolve | reject | notify ]
            deferred[tuple[0]] = function () {
                deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments);
                return this;
            };
            deferred[tuple[0] + "With"] = list.fireWith;
        });

        // Make the deferred a promise
        promise.promise(deferred);

        // Call given func if any
        if (func) {
            func.call(deferred, deferred);
        }

        // All done!
        return deferred;
    };
    jQuery.Event = function (src, props) {

        // Allow instantiation without the 'new' keyword
        if (!(this instanceof jQuery.Event)) {
            return new jQuery.Event(src, props);
        }

        // Event object
        if (src && src.type) {
            this.originalEvent = src;
            this.type = src.type;

            // Events bubbling up the document may have been marked as prevented
            // by a handler lower down the tree; reflect the correct value.
            this.isDefaultPrevented = (src.defaultPrevented ||
                src.getPreventDefault && src.getPreventDefault()) ? returnTrue : returnFalse;

            // Event type
        } else {
            this.type = src;
        }

        // Put explicitly provided properties onto the event object
        if (props) {
            jQuery.extend(this, props);
        }

        // Create a timestamp if incoming event doesn't have one
        this.timeStamp = src && src.timeStamp || jQuery.now();

        // Mark it as fixed
        this[jQuery.expando] = true;
    };
    jQuery.Tween = function Tween(elem, options, prop, end, easing) {

        return new Tween.prototype.init(elem, options, prop, end, easing);
    };
    jQuery._data = function (elem, name, data) {

        return data_priv.access(elem, name, data);
    };
    jQuery._evalUrl = function (url) {

        return jQuery.ajax({
            url: url,
            type: "GET",
            dataType: "text",
            async: false,
            global: false,
            success: jQuery.globalEval
        });
    };
    jQuery._queueHooks = function (elem, type) {

        var key = type + "queueHooks";
        return data_priv.get(elem, key) || data_priv.access(elem, key, {
            empty: jQuery.Callbacks("once memory").add(function () {
                data_priv.remove(elem, [type + "queue", key]);
            })
        });
    };
    jQuery._removeData = function (elem, name) {

        data_priv.remove(elem, name);
    };
    jQuery.acceptData = function (owner) {

        // Accepts only:
        //  - Node
        //    - Node.ELEMENT_NODE
        //    - Node.DOCUMENT_NODE
        //  - Object
        //    - Any
        return owner.nodeType ?
            owner.nodeType === 1 || owner.nodeType === 9 : true;
    };
    jQuery.access = function (elems, fn, key, value, chainable, emptyGet, raw) {

        var i = 0,
			length = elems.length,
			bulk = key == null;

        // Sets many values
        if (jQuery.type(key) === "object") {
            chainable = true;
            for (i in key) {
                jQuery.access(elems, fn, i, key[i], true, emptyGet, raw);
            }

            // Sets one value
        } else if (value !== undefined) {
            chainable = true;

            if (!jQuery.isFunction(value)) {
                raw = true;
            }

            if (bulk) {
                // Bulk operations run against the entire set
                if (raw) {
                    fn.call(elems, value);
                    fn = null;

                    // ...except when executing function values
                } else {
                    bulk = fn;
                    fn = function (elem, key, value) {
                        return bulk.call(jQuery(elem), value);
                    };
                }
            }

            if (fn) {
                for (; i < length; i++) {
                    fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
                }
            }
        }

        return chainable ?
            elems :

			// Gets
			bulk ?
				fn.call(elems) :
				length ? fn(elems[0], key) : emptyGet;
    };
    jQuery.active = 0;
    jQuery.ajax = function (url, options) {
        /// <summary>
        ///     Perform an asynchronous HTTP (Ajax) request.
        ///     &#10;1 - jQuery.ajax(url, settings) 
        ///     &#10;2 - jQuery.ajax(settings)
        /// </summary>
        /// <param name="url" type="String">
        ///     A string containing the URL to which the request is sent.
        /// </param>
        /// <param name="options" type="PlainObject">
        ///     A set of key/value pairs that configure the Ajax request. All settings are optional. A default can be set for any option with $.ajaxSetup(). See jQuery.ajax( settings ) below for a complete list of all settings.
        /// </param>


        // If url is an object, simulate pre-1.5 signature
        if (typeof url === "object") {
            options = url;
            url = undefined;
        }

        // Force options to be an object
        options = options || {};

        var transport,
			// URL without anti-cache param
			cacheURL,
			// Response headers
			responseHeadersString,
			responseHeaders,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Create the final options object
			s = jQuery.ajaxSetup({}, options),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ?
				jQuery(callbackContext) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
			    readyState: 0,

			    // Builds headers hashtable if needed
			    getResponseHeader: function (key) {
			        var match;
			        if (state === 2) {
			            if (!responseHeaders) {
			                responseHeaders = {};
			                while ((match = rheaders.exec(responseHeadersString))) {
			                    responseHeaders[match[1].toLowerCase()] = match[2];
			                }
			            }
			            match = responseHeaders[key.toLowerCase()];
			        }
			        return match == null ? null : match;
			    },

			    // Raw string
			    getAllResponseHeaders: function () {
			        return state === 2 ? responseHeadersString : null;
			    },

			    // Caches the header
			    setRequestHeader: function (name, value) {
			        var lname = name.toLowerCase();
			        if (!state) {
			            name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
			            requestHeaders[name] = value;
			        }
			        return this;
			    },

			    // Overrides response content-type header
			    overrideMimeType: function (type) {
			        if (!state) {
			            s.mimeType = type;
			        }
			        return this;
			    },

			    // Status-dependent callbacks
			    statusCode: function (map) {
			        var code;
			        if (map) {
			            if (state < 2) {
			                for (code in map) {
			                    // Lazy-add the new callback in a way that preserves old ones
			                    statusCode[code] = [statusCode[code], map[code]];
			                }
			            } else {
			                // Execute the appropriate callbacks
			                jqXHR.always(map[jqXHR.status]);
			            }
			        }
			        return this;
			    },

			    // Cancel the request
			    abort: function (statusText) {
			        var finalText = statusText || strAbort;
			        if (transport) {
			            transport.abort(finalText);
			        }
			        done(0, finalText);
			        return this;
			    }
			};

        // Attach deferreds
        deferred.promise(jqXHR).complete = completeDeferred.add;
        jqXHR.success = jqXHR.done;
        jqXHR.error = jqXHR.fail;

        // Remove hash character (#7531: and string promotion)
        // Add protocol if not provided (prefilters might expect it)
        // Handle falsy url in the settings object (#10093: consistency with old signature)
        // We also use the url parameter if available
        s.url = ((url || s.url || ajaxLocation) + "").replace(rhash, "")
			.replace(rprotocol, ajaxLocParts[1] + "//");

        // Alias method option to type as per ticket #12004
        s.type = options.method || options.type || s.method || s.type;

        // Extract dataTypes list
        s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().match(core_rnotwhite) || [""];

        // A cross-domain request is in order when we have a protocol:host:port mismatch
        if (s.crossDomain == null) {
            parts = rurl.exec(s.url.toLowerCase());
            s.crossDomain = !!(parts &&
				(parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] ||
					(parts[3] || (parts[1] === "http:" ? "80" : "443")) !==
						(ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? "80" : "443")))
			);
        }

        // Convert data if not already a string
        if (s.data && s.processData && typeof s.data !== "string") {
            s.data = jQuery.param(s.data, s.traditional);
        }

        // Apply prefilters
        inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);

        // If request was aborted inside a prefilter, stop there
        if (state === 2) {
            return jqXHR;
        }

        // We can fire global events as of now if asked to
        fireGlobals = s.global;

        // Watch for a new set of requests
        if (fireGlobals && jQuery.active++ === 0) {
            jQuery.event.trigger("ajaxStart");
        }

        // Uppercase the type
        s.type = s.type.toUpperCase();

        // Determine if request has content
        s.hasContent = !rnoContent.test(s.type);

        // Save the URL in case we're toying with the If-Modified-Since
        // and/or If-None-Match header later on
        cacheURL = s.url;

        // More options handling for requests with no content
        if (!s.hasContent) {

            // If data is available, append data to url
            if (s.data) {
                cacheURL = (s.url += (ajax_rquery.test(cacheURL) ? "&" : "?") + s.data);
                // #9682: remove data so that it's not used in an eventual retry
                delete s.data;
            }

            // Add anti-cache in url if needed
            if (s.cache === false) {
                s.url = rts.test(cacheURL) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace(rts, "$1_=" + ajax_nonce++) :

					// Otherwise add one to the end
					cacheURL + (ajax_rquery.test(cacheURL) ? "&" : "?") + "_=" + ajax_nonce++;
            }
        }

        // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
        if (s.ifModified) {
            if (jQuery.lastModified[cacheURL]) {
                jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[cacheURL]);
            }
            if (jQuery.etag[cacheURL]) {
                jqXHR.setRequestHeader("If-None-Match", jQuery.etag[cacheURL]);
            }
        }

        // Set the correct header, if data is being sent
        if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
            jqXHR.setRequestHeader("Content-Type", s.contentType);
        }

        // Set the Accepts header for the server, depending on the dataType
        jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[0] && s.accepts[s.dataTypes[0]] ?
				s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") :
				s.accepts["*"]
		);

        // Check for headers option
        for (i in s.headers) {
            jqXHR.setRequestHeader(i, s.headers[i]);
        }

        // Allow custom headers/mimetypes and early abort
        if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2)) {
            // Abort if not done already and return
            return jqXHR.abort();
        }

        // aborting is no longer a cancellation
        strAbort = "abort";

        // Install callbacks on deferreds
        for (i in { success: 1, error: 1, complete: 1 }) {
            jqXHR[i](s[i]);
        }

        // Get transport
        transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);

        // If no transport, we auto-abort
        if (!transport) {
            done(-1, "No Transport");
        } else {
            jqXHR.readyState = 1;

            // Send global event
            if (fireGlobals) {
                globalEventContext.trigger("ajaxSend", [jqXHR, s]);
            }
            // Timeout
            if (s.async && s.timeout > 0) {
                timeoutTimer = setTimeout(function () {
                    jqXHR.abort("timeout");
                }, s.timeout);
            }

            try {
                state = 1;
                transport.send(requestHeaders, done);
            } catch (e) {
                // Propagate exception as error if not done
                if (state < 2) {
                    done(-1, e);
                    // Simply rethrow otherwise
                } else {
                    throw e;
                }
            }
        }

        // Callback for when everything is done
        function done(status, nativeStatusText, responses, headers) {
            var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

            // Called once
            if (state === 2) {
                return;
            }

            // State is "done" now
            state = 2;

            // Clear timeout if it exists
            if (timeoutTimer) {
                clearTimeout(timeoutTimer);
            }

            // Dereference transport for early garbage collection
            // (no matter how long the jqXHR object will be used)
            transport = undefined;

            // Cache response headers
            responseHeadersString = headers || "";

            // Set readyState
            jqXHR.readyState = status > 0 ? 4 : 0;

            // Determine if successful
            isSuccess = status >= 200 && status < 300 || status === 304;

            // Get response data
            if (responses) {
                response = ajaxHandleResponses(s, jqXHR, responses);
            }

            // Convert no matter what (that way responseXXX fields are always set)
            response = ajaxConvert(s, response, jqXHR, isSuccess);

            // If successful, handle type chaining
            if (isSuccess) {

                // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
                if (s.ifModified) {
                    modified = jqXHR.getResponseHeader("Last-Modified");
                    if (modified) {
                        jQuery.lastModified[cacheURL] = modified;
                    }
                    modified = jqXHR.getResponseHeader("etag");
                    if (modified) {
                        jQuery.etag[cacheURL] = modified;
                    }
                }

                // if no content
                if (status === 204) {
                    statusText = "nocontent";

                    // if not modified
                } else if (status === 304) {
                    statusText = "notmodified";

                    // If we have data, let's convert it
                } else {
                    statusText = response.state;
                    success = response.data;
                    error = response.error;
                    isSuccess = !error;
                }
            } else {
                // We extract error from statusText
                // then normalize statusText and status for non-aborts
                error = statusText;
                if (status || !statusText) {
                    statusText = "error";
                    if (status < 0) {
                        status = 0;
                    }
                }
            }

            // Set data for the fake xhr object
            jqXHR.status = status;
            jqXHR.statusText = (nativeStatusText || statusText) + "";

            // Success/Error
            if (isSuccess) {
                deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
            } else {
                deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
            }

            // Status-dependent callbacks
            jqXHR.statusCode(statusCode);
            statusCode = undefined;

            if (fireGlobals) {
                globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError",
					[jqXHR, s, isSuccess ? success : error]);
            }

            // Complete
            completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);

            if (fireGlobals) {
                globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
                // Handle the global AJAX counter
                if (!(--jQuery.active)) {
                    jQuery.event.trigger("ajaxStop");
                }
            }
        }

        return jqXHR;
    };
    jQuery.ajaxPrefilter = function (dataTypeExpression, func) {
        /// <summary>
        ///     Handle custom Ajax options or modify existing options before each request is sent and before they are processed by $.ajax().
        /// </summary>
        /// <param name="dataTypeExpression" type="String">
        ///     An optional string containing one or more space-separated dataTypes
        /// </param>
        /// <param name="func" type="Function">
        ///     A handler to set default values for future Ajax requests.
        /// </param>
        /// <returns type="undefined" />


        if (typeof dataTypeExpression !== "string") {
            func = dataTypeExpression;
            dataTypeExpression = "*";
        }

        var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match(core_rnotwhite) || [];

        if (jQuery.isFunction(func)) {
            // For each dataType in the dataTypeExpression
            while ((dataType = dataTypes[i++])) {
                // Prepend if requested
                if (dataType[0] === "+") {
                    dataType = dataType.slice(1) || "*";
                    (structure[dataType] = structure[dataType] || []).unshift(func);

                    // Otherwise append
                } else {
                    (structure[dataType] = structure[dataType] || []).push(func);
                }
            }
        }
    };
    jQuery.ajaxSettings = {
        "url": 'http://localhost:25812/?ver=2.0.2&newLineMethod=xml',
        "type": 'GET',
        "isLocal": false,
        "global": true,
        "processData": true,
        "async": true,
        "contentType": 'application/x-www-form-urlencoded; charset=UTF-8',
        "accepts": {},
        "contents": {},
        "responseFields": {},
        "converters": {},
        "flatOptions": {},
        "jsonp": 'callback'
    };
    jQuery.ajaxSetup = function (target, settings) {
        /// <summary>
        ///     Set default values for future Ajax requests. Its use is not recommended.
        /// </summary>
        /// <param name="target" type="PlainObject">
        ///     A set of key/value pairs that configure the default Ajax request. All options are optional.
        /// </param>

        return settings ?

			// Building a settings object
			ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings) :

			// Extending ajaxSettings
			ajaxExtend(jQuery.ajaxSettings, target);
    };
    jQuery.ajaxTransport = function (dataTypeExpression, func) {
        /// <summary>
        ///     Creates an object that handles the actual transmission of Ajax data.
        /// </summary>
        /// <param name="dataTypeExpression" type="String">
        ///     A string identifying the data type to use
        /// </param>
        /// <param name="func" type="Function">
        ///     A handler to return the new transport object to use with the data type provided in the first argument.
        /// </param>
        /// <returns type="undefined" />


        if (typeof dataTypeExpression !== "string") {
            func = dataTypeExpression;
            dataTypeExpression = "*";
        }

        var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match(core_rnotwhite) || [];

        if (jQuery.isFunction(func)) {
            // For each dataType in the dataTypeExpression
            while ((dataType = dataTypes[i++])) {
                // Prepend if requested
                if (dataType[0] === "+") {
                    dataType = dataType.slice(1) || "*";
                    (structure[dataType] = structure[dataType] || []).unshift(func);

                    // Otherwise append
                } else {
                    (structure[dataType] = structure[dataType] || []).push(func);
                }
            }
        }
    };
    jQuery.attr = function (elem, name, value) {

        var hooks, ret,
			nType = elem.nodeType;

        // don't get/set attributes on text, comment and attribute nodes
        if (!elem || nType === 3 || nType === 8 || nType === 2) {
            return;
        }

        // Fallback to prop when attributes are not supported
        if (typeof elem.getAttribute === core_strundefined) {
            return jQuery.prop(elem, name, value);
        }

        // All attributes are lowercase
        // Grab necessary hook if one is defined
        if (nType !== 1 || !jQuery.isXMLDoc(elem)) {
            name = name.toLowerCase();
            hooks = jQuery.attrHooks[name] ||
				(jQuery.expr.match.boolean.test(name) ? boolHook : nodeHook);
        }

        if (value !== undefined) {

            if (value === null) {
                jQuery.removeAttr(elem, name);

            } else if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
                return ret;

            } else {
                elem.setAttribute(name, value + "");
                return value;
            }

        } else if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
            return ret;

        } else {
            ret = jQuery.find.attr(elem, name);

            // Non-existent attributes return null, we normalize to undefined
            return ret == null ?
                undefined :
				ret;
        }
    };
    jQuery.attrHooks = { "type": {} };
    jQuery.buildFragment = function (elems, context, scripts, selection) {

        var elem, tmp, tag, wrap, contains, j,
			i = 0,
			l = elems.length,
			fragment = context.createDocumentFragment(),
			nodes = [];

        for (; i < l; i++) {
            elem = elems[i];

            if (elem || elem === 0) {

                // Add nodes directly
                if (jQuery.type(elem) === "object") {
                    // Support: QtWebKit
                    // jQuery.merge because core_push.apply(_, arraylike) throws
                    jQuery.merge(nodes, elem.nodeType ? [elem] : elem);

                    // Convert non-html into a text node
                } else if (!rhtml.test(elem)) {
                    nodes.push(context.createTextNode(elem));

                    // Convert html into DOM nodes
                } else {
                    tmp = tmp || fragment.appendChild(context.createElement("div"));

                    // Deserialize a standard representation
                    tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
                    wrap = wrapMap[tag] || wrapMap._default;
                    tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag, "<$1></$2>") + wrap[2];

                    // Descend through wrappers to the right content
                    j = wrap[0];
                    while (j--) {
                        tmp = tmp.firstChild;
                    }

                    // Support: QtWebKit
                    // jQuery.merge because core_push.apply(_, arraylike) throws
                    jQuery.merge(nodes, tmp.childNodes);

                    // Remember the top-level container
                    tmp = fragment.firstChild;

                    // Fixes #12346
                    // Support: Webkit, IE
                    tmp.textContent = "";
                }
            }
        }

        // Remove wrapper from fragment
        fragment.textContent = "";

        i = 0;
        while ((elem = nodes[i++])) {

            // #4087 - If origin and destination elements are the same, and this is
            // that element, do not do anything
            if (selection && jQuery.inArray(elem, selection) !== -1) {
                continue;
            }

            contains = jQuery.contains(elem.ownerDocument, elem);

            // Append to fragment
            tmp = getAll(fragment.appendChild(elem), "script");

            // Preserve script evaluation history
            if (contains) {
                setGlobalEval(tmp);
            }

            // Capture executables
            if (scripts) {
                j = 0;
                while ((elem = tmp[j++])) {
                    if (rscriptType.test(elem.type || "")) {
                        scripts.push(elem);
                    }
                }
            }
        }

        return fragment;
    };
    jQuery.camelCase = function (string) {

        return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
    };
    jQuery.cleanData = function (elems) {

        var data, elem, type,
			l = elems.length,
			i = 0,
			special = jQuery.event.special;

        for (; i < l; i++) {
            elem = elems[i];

            if (jQuery.acceptData(elem)) {

                data = data_priv.access(elem);

                if (data) {
                    for (type in data.events) {
                        if (special[type]) {
                            jQuery.event.remove(elem, type);

                            // This is a shortcut to avoid jQuery.event.remove's overhead
                        } else {
                            jQuery.removeEvent(elem, type, data.handle);
                        }
                    }
                }
            }
            // Discard any remaining `private` and `user` data
            // One day we'll replace the dual arrays with a WeakMap and this won't be an issue.
            // (Splices the data objects out of the internal cache arrays)
            data_user.discard(elem);
            data_priv.discard(elem);
        }
    };
    jQuery.clone = function (elem, dataAndEvents, deepDataAndEvents) {

        var i, l, srcElements, destElements,
			clone = elem.cloneNode(true),
			inPage = jQuery.contains(elem.ownerDocument, elem);

        // Support: IE >= 9
        // Fix Cloning issues
        if (!jQuery.support.noCloneChecked && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem)) {

            // We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
            destElements = getAll(clone);
            srcElements = getAll(elem);

            for (i = 0, l = srcElements.length; i < l; i++) {
                fixInput(srcElements[i], destElements[i]);
            }
        }

        // Copy the events from the original to the clone
        if (dataAndEvents) {
            if (deepDataAndEvents) {
                srcElements = srcElements || getAll(elem);
                destElements = destElements || getAll(clone);

                for (i = 0, l = srcElements.length; i < l; i++) {
                    cloneCopyEvent(srcElements[i], destElements[i]);
                }
            } else {
                cloneCopyEvent(elem, clone);
            }
        }

        // Preserve script evaluation history
        destElements = getAll(clone, "script");
        if (destElements.length > 0) {
            setGlobalEval(destElements, !inPage && getAll(elem, "script"));
        }

        // Return the cloned set
        return clone;
    };
    jQuery.contains = function (context, elem) {
        /// <summary>
        ///     Check to see if a DOM element is a descendant of another DOM element.
        /// </summary>
        /// <param name="context" domElement="true">
        ///     The DOM element that may contain the other element.
        /// </param>
        /// <param name="elem" domElement="true">
        ///     The DOM element that may be contained by (a descendant of) the other element.
        /// </param>
        /// <returns type="Boolean" />

        // Set document vars if needed
        if ((context.ownerDocument || context) !== document) {
            setDocument(context);
        }
        return contains(context, elem);
    };
    jQuery.css = function (elem, name, extra, styles) {

        var val, num, hooks,
			origName = jQuery.camelCase(name);

        // Make sure that we're working with the right name
        name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(elem.style, origName));

        // gets hook for the prefixed version
        // followed by the unprefixed version
        hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];

        // If a hook was provided get the computed value from there
        if (hooks && "get" in hooks) {
            val = hooks.get(elem, true, extra);
        }

        // Otherwise, if a way to get the computed value exists, use that
        if (val === undefined) {
            val = curCSS(elem, name, styles);
        }

        //convert "normal" to computed value
        if (val === "normal" && name in cssNormalTransform) {
            val = cssNormalTransform[name];
        }

        // Return, converting to number if forced or a qualifier was provided and val looks numeric
        if (extra === "" || extra) {
            num = parseFloat(val);
            return extra === true || jQuery.isNumeric(num) ? num || 0 : val;
        }
        return val;
    };
    jQuery.cssHooks = {
        "opacity": {},
        "height": {},
        "width": {},
        "margin": {},
        "padding": {},
        "borderWidth": {},
        "top": {},
        "left": {}
    };
    jQuery.cssNumber = {
        "columnCount": true,
        "fillOpacity": true,
        "fontWeight": true,
        "lineHeight": true,
        "opacity": true,
        "orphans": true,
        "widows": true,
        "zIndex": true,
        "zoom": true
    };
    jQuery.cssProps = {
        "float": 'cssFloat',
        "display": 'display',
        "visibility": 'visibility'
    };
    jQuery.data = function (elem, name, data) {
        /// <summary>
        ///     1: Store arbitrary data associated with the specified element. Returns the value that was set.
        ///     &#10;    1.1 - jQuery.data(element, key, value)
        ///     &#10;2: Returns value at named data store for the element, as set by jQuery.data(element, name, value), or the full data store for the element.
        ///     &#10;    2.1 - jQuery.data(element, key) 
        ///     &#10;    2.2 - jQuery.data(element)
        /// </summary>
        /// <param name="elem" domElement="true">
        ///     The DOM element to associate with the data.
        /// </param>
        /// <param name="name" type="String">
        ///     A string naming the piece of data to set.
        /// </param>
        /// <param name="data" type="Object">
        ///     The new data value.
        /// </param>
        /// <returns type="Object" />

        return data_user.access(elem, name, data);
    };
    jQuery.dequeue = function (elem, type) {
        /// <summary>
        ///     Execute the next function on the queue for the matched element.
        /// </summary>
        /// <param name="elem" domElement="true">
        ///     A DOM element from which to remove and execute a queued function.
        /// </param>
        /// <param name="type" type="String">
        ///     A string containing the name of the queue. Defaults to fx, the standard effects queue.
        /// </param>
        /// <returns type="undefined" />

        type = type || "fx";

        var queue = jQuery.queue(elem, type),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks(elem, type),
			next = function () {
			    jQuery.dequeue(elem, type);
			};

        // If the fx queue is dequeued, always remove the progress sentinel
        if (fn === "inprogress") {
            fn = queue.shift();
            startLength--;
        }

        hooks.cur = fn;
        if (fn) {

            // Add a progress sentinel to prevent the fx queue from being
            // automatically dequeued
            if (type === "fx") {
                queue.unshift("inprogress");
            }

            // clear up the last queue stop function
            delete hooks.stop;
            fn.call(elem, next, hooks);
        }

        if (!startLength && hooks) {
            hooks.empty.fire();
        }
    };
    jQuery.dir = function (elem, dir, until) {

        var matched = [],
			truncate = until !== undefined;

        while ((elem = elem[dir]) && elem.nodeType !== 9) {
            if (elem.nodeType === 1) {
                if (truncate && jQuery(elem).is(until)) {
                    break;
                }
                matched.push(elem);
            }
        }
        return matched;
    };
    jQuery.each = function (obj, callback, args) {
        /// <summary>
        ///     A generic iterator function, which can be used to seamlessly iterate over both objects and arrays. Arrays and array-like objects with a length property (such as a function's arguments object) are iterated by numeric index, from 0 to length-1. Other objects are iterated via their named properties.
        /// </summary>
        /// <param name="obj" type="Object">
        ///     The object or array to iterate over.
        /// </param>
        /// <param name="callback" type="Function">
        ///     The function that will be executed on every object.
        /// </param>
        /// <returns type="Object" />

        var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike(obj);

        if (args) {
            if (isArray) {
                for (; i < length; i++) {
                    value = callback.apply(obj[i], args);

                    if (value === false) {
                        break;
                    }
                }
            } else {
                for (i in obj) {
                    value = callback.apply(obj[i], args);

                    if (value === false) {
                        break;
                    }
                }
            }

            // A special, fast, case for the most common use of each
        } else {
            if (isArray) {
                for (; i < length; i++) {
                    value = callback.call(obj[i], i, obj[i]);

                    if (value === false) {
                        break;
                    }
                }
            } else {
                for (i in obj) {
                    value = callback.call(obj[i], i, obj[i]);

                    if (value === false) {
                        break;
                    }
                }
            }
        }

        return obj;
    };
    jQuery.easing = {};
    jQuery.error = function (msg) {
        /// <summary>
        ///     Takes a string and throws an exception containing it.
        /// </summary>
        /// <param name="msg" type="String">
        ///     The message to send out.
        /// </param>

        throw new Error(msg);
    };
    jQuery.etag = {};
    jQuery.event = {
        "global": {},
        "props": ['altKey', 'bubbles', 'cancelable', 'ctrlKey', 'currentTarget', 'eventPhase', 'metaKey', 'relatedTarget', 'shiftKey', 'target', 'timeStamp', 'view', 'which'],
        "fixHooks": {},
        "keyHooks": {},
        "mouseHooks": {},
        "special": {},
        "triggered": {}
    };
    jQuery.expr = {
        "cacheLength": 50,
        "match": {},
        "attrHandle": {},
        "find": {},
        "relative": {},
        "preFilter": {},
        "filter": {},
        "pseudos": {},
        "filters": {},
        "setFilters": {},
        ":": {}
    };
    jQuery.extend = function () {
        /// <summary>
        ///     Merge the contents of two or more objects together into the first object.
        ///     &#10;1 - jQuery.extend(target, object1, objectN) 
        ///     &#10;2 - jQuery.extend(deep, target, object1, objectN)
        /// </summary>
        /// <param name="" type="Boolean">
        ///     If true, the merge becomes recursive (aka. deep copy).
        /// </param>
        /// <param name="" type="Object">
        ///     The object to extend. It will receive the new properties.
        /// </param>
        /// <param name="" type="Object">
        ///     An object containing additional properties to merge in.
        /// </param>
        /// <param name="" type="Object">
        ///     Additional objects containing properties to merge in.
        /// </param>
        /// <returns type="Object" />

        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== "object" && !jQuery.isFunction(target)) {
            target = {};
        }

        // extend jQuery itself if only one argument is passed
        if (length === i) {
            target = this;
            --i;
        }

        for (; i < length; i++) {
            // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null) {
                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && jQuery.isArray(src) ? src : [];

                        } else {
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[name] = jQuery.extend(deep, clone, copy);

                        // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    };
    jQuery.filter = function (expr, elems, not) {

        var elem = elems[0];

        if (not) {
            expr = ":not(" + expr + ")";
        }

        return elems.length === 1 && elem.nodeType === 1 ?
			jQuery.find.matchesSelector(elem, expr) ? [elem] : [] :
			jQuery.find.matches(expr, jQuery.grep(elems, function (elem) {
			    return elem.nodeType === 1;
			}));
    };
    jQuery.find = function Sizzle(selector, context, results, seed) {

        var match, elem, m, nodeType,
            // QSA vars
            i, groups, old, nid, newContext, newSelector;

        if ((context ? context.ownerDocument || context : preferredDoc) !== document) {
            setDocument(context);
        }

        context = context || document;
        results = results || [];

        if (!selector || typeof selector !== "string") {
            return results;
        }

        if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
            return [];
        }

        if (documentIsHTML && !seed) {

            // Shortcuts
            if ((match = rquickExpr.exec(selector))) {
                // Speed-up: Sizzle("#ID")
                if ((m = match[1])) {
                    if (nodeType === 9) {
                        elem = context.getElementById(m);
                        // Check parentNode to catch when Blackberry 4.6 returns
                        // nodes that are no longer in the document #6963
                        if (elem && elem.parentNode) {
                            // Handle the case where IE, Opera, and Webkit return items
                            // by name instead of ID
                            if (elem.id === m) {
                                results.push(elem);
                                return results;
                            }
                        } else {
                            return results;
                        }
                    } else {
                        // Context is not a document
                        if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) &&
                            contains(context, elem) && elem.id === m) {
                            results.push(elem);
                            return results;
                        }
                    }

                    // Speed-up: Sizzle("TAG")
                } else if (match[2]) {
                    push.apply(results, context.getElementsByTagName(selector));
                    return results;

                    // Speed-up: Sizzle(".CLASS")
                } else if ((m = match[3]) && support.getElementsByClassName && context.getElementsByClassName) {
                    push.apply(results, context.getElementsByClassName(m));
                    return results;
                }
            }

            // QSA path
            if (support.qsa && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
                nid = old = expando;
                newContext = context;
                newSelector = nodeType === 9 && selector;

                // qSA works strangely on Element-rooted queries
                // We can work around this by specifying an extra ID on the root
                // and working up from there (Thanks to Andrew Dupont for the technique)
                // IE 8 doesn't work on object elements
                if (nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
                    groups = tokenize(selector);

                    if ((old = context.getAttribute("id"))) {
                        nid = old.replace(rescape, "\\$&");
                    } else {
                        context.setAttribute("id", nid);
                    }
                    nid = "[id='" + nid + "'] ";

                    i = groups.length;
                    while (i--) {
                        groups[i] = nid + toSelector(groups[i]);
                    }
                    newContext = rsibling.test(selector) && context.parentNode || context;
                    newSelector = groups.join(",");
                }

                if (newSelector) {
                    try {
                        push.apply(results,
                            newContext.querySelectorAll(newSelector)
                        );
                        return results;
                    } catch (qsaError) {
                    } finally {
                        if (!old) {
                            context.removeAttribute("id");
                        }
                    }
                }
            }
        }

        // All others
        return select(selector.replace(rtrim, "$1"), context, results, seed);
    };
    jQuery.fn = {
        "jquery": '2.0.2',
        "selector": '',
        "length": 0
    };
    jQuery.fx = function (elem, options, prop, end, easing, unit) {

        this.elem = elem;
        this.prop = prop;
        this.easing = easing || "swing";
        this.options = options;
        this.start = this.now = this.cur();
        this.end = end;
        this.unit = unit || (jQuery.cssNumber[prop] ? "" : "px");
    };
    jQuery.get = function (url, data, callback, type) {
        /// <summary>
        ///     Load data from the server using a HTTP GET request.
        /// </summary>
        /// <param name="url" type="String">
        ///     A string containing the URL to which the request is sent.
        /// </param>
        /// <param name="data" type="">
        ///     A plain object or string that is sent to the server with the request.
        /// </param>
        /// <param name="callback" type="Function">
        ///     A callback function that is executed if the request succeeds.
        /// </param>
        /// <param name="type" type="String">
        ///     The type of data expected from the server. Default: Intelligent Guess (xml, json, script, or html).
        /// </param>

        // shift arguments if data argument was omitted
        if (jQuery.isFunction(data)) {
            type = type || callback;
            callback = data;
            data = undefined;
        }

        return jQuery.ajax({
            url: url,
            type: method,
            dataType: type,
            data: data,
            success: callback
        });
    };
    jQuery.getJSON = function (url, data, callback) {
        /// <summary>
        ///     Load JSON-encoded data from the server using a GET HTTP request.
        /// </summary>
        /// <param name="url" type="String">
        ///     A string containing the URL to which the request is sent.
        /// </param>
        /// <param name="data" type="PlainObject">
        ///     A plain object or string that is sent to the server with the request.
        /// </param>
        /// <param name="callback" type="Function">
        ///     A callback function that is executed if the request succeeds.
        /// </param>

        return jQuery.get(url, data, callback, "json");
    };
    jQuery.getScript = function (url, callback) {
        /// <summary>
        ///     Load a JavaScript file from the server using a GET HTTP request, then execute it.
        /// </summary>
        /// <param name="url" type="String">
        ///     A string containing the URL to which the request is sent.
        /// </param>
        /// <param name="callback" type="Function">
        ///     A callback function that is executed if the request succeeds.
        /// </param>

        return jQuery.get(url, undefined, callback, "script");
    };
    jQuery.globalEval = function (code) {
        /// <summary>
        ///     Execute some JavaScript code globally.
        /// </summary>
        /// <param name="code" type="String">
        ///     The JavaScript code to execute.
        /// </param>

        var script,
				indirect = eval;

        code = jQuery.trim(code);

        if (code) {
            // If the code includes a valid, prologue position
            // strict mode pragma, execute code by injecting a
            // script tag into the document.
            if (code.indexOf("use strict") === 1) {
                script = document.createElement("script");
                script.text = code;
                document.head.appendChild(script).parentNode.removeChild(script);
            } else {
                // Otherwise, avoid the DOM node creation, insertion
                // and removal by using an indirect global eval
                indirect(code);
            }
        }
    };
    jQuery.grep = function (elems, callback, inv) {
        /// <summary>
        ///     Finds the elements of an array which satisfy a filter function. The original array is not affected.
        /// </summary>
        /// <param name="elems" type="Array">
        ///     The array to search through.
        /// </param>
        /// <param name="callback" type="Function">
        ///     The function to process each item against.  The first argument to the function is the item, and the second argument is the index.  The function should return a Boolean value.  this will be the global window object.
        /// </param>
        /// <param name="inv" type="Boolean">
        ///     If "invert" is false, or not provided, then the function returns an array consisting of all elements for which "callback" returns true.  If "invert" is true, then the function returns an array consisting of all elements for which "callback" returns false.
        /// </param>
        /// <returns type="Array" />

        var retVal,
			ret = [],
			i = 0,
			length = elems.length;
        inv = !!inv;

        // Go through the array, only saving the items
        // that pass the validator function
        for (; i < length; i++) {
            retVal = !!callback(elems[i], i);
            if (inv !== retVal) {
                ret.push(elems[i]);
            }
        }

        return ret;
    };
    jQuery.guid = 1;
    jQuery.hasData = function (elem) {
        /// <summary>
        ///     Determine whether an element has any jQuery data associated with it.
        /// </summary>
        /// <param name="elem" domElement="true">
        ///     A DOM element to be checked for data.
        /// </param>
        /// <returns type="Boolean" />

        return data_user.hasData(elem) || data_priv.hasData(elem);
    };
    jQuery.holdReady = function (hold) {
        /// <summary>
        ///     Holds or releases the execution of jQuery's ready event.
        /// </summary>
        /// <param name="hold" type="Boolean">
        ///     Indicates whether the ready hold is being requested or released
        /// </param>
        /// <returns type="undefined" />

        if (hold) {
            jQuery.readyWait++;
        } else {
            jQuery.ready(true);
        }
    };
    jQuery.inArray = function (elem, arr, i) {
        /// <summary>
        ///     Search for a specified value within an array and return its index (or -1 if not found).
        /// </summary>
        /// <param name="elem" type="Anything">
        ///     The value to search for.
        /// </param>
        /// <param name="arr" type="Array">
        ///     An array through which to search.
        /// </param>
        /// <param name="i" type="Number">
        ///     The index of the array at which to begin the search. The default is 0, which will search the whole array.
        /// </param>
        /// <returns type="Number" />

        return arr == null ? -1 : core_indexOf.call(arr, elem, i);
    };
    jQuery.isEmptyObject = function (obj) {
        /// <summary>
        ///     Check to see if an object is empty (contains no enumerable properties).
        /// </summary>
        /// <param name="obj" type="Object">
        ///     The object that will be checked to see if it's empty.
        /// </param>
        /// <returns type="Boolean" />

        var name;
        for (name in obj) {
            return false;
        }
        return true;
    };
    jQuery.isFunction = function (obj) {
        /// <summary>
        ///     Determine if the argument passed is a Javascript function object.
        /// </summary>
        /// <param name="obj" type="PlainObject">
        ///     Object to test whether or not it is a function.
        /// </param>
        /// <returns type="boolean" />

        return jQuery.type(obj) === "function";
    };
    jQuery.isNumeric = function (obj) {
        /// <summary>
        ///     Determines whether its argument is a number.
        /// </summary>
        /// <param name="obj" type="PlainObject">
        ///     The value to be tested.
        /// </param>
        /// <returns type="Boolean" />

        return !isNaN(parseFloat(obj)) && isFinite(obj);
    };
    jQuery.isPlainObject = function (obj) {
        /// <summary>
        ///     Check to see if an object is a plain object (created using "{}" or "new Object").
        /// </summary>
        /// <param name="obj" type="PlainObject">
        ///     The object that will be checked to see if it's a plain object.
        /// </param>
        /// <returns type="Boolean" />

        // Not plain objects:
        // - Any object or value whose internal [[Class]] property is not "[object Object]"
        // - DOM nodes
        // - window
        if (jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj)) {
            return false;
        }

        // Support: Firefox <20
        // The try/catch suppresses exceptions thrown when attempting to access
        // the "constructor" property of certain host objects, ie. |window.location|
        // https://bugzilla.mozilla.org/show_bug.cgi?id=814622
        try {
            if (obj.constructor &&
					!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }
        } catch (e) {
            return false;
        }

        // If the function hasn't returned already, we're confident that
        // |obj| is a plain object, created by {} or constructed with new Object
        return true;
    };
    jQuery.isReady = true;
    jQuery.isWindow = function (obj) {
        /// <summary>
        ///     Determine whether the argument is a window.
        /// </summary>
        /// <param name="obj" type="PlainObject">
        ///     Object to test whether or not it is a window.
        /// </param>
        /// <returns type="boolean" />

        return obj != null && obj === obj.window;
    };
    jQuery.isXMLDoc = function (elem) {
        /// <summary>
        ///     Check to see if a DOM node is within an XML document (or is an XML document).
        /// </summary>
        /// <param name="elem" domElement="true">
        ///     The DOM node that will be checked to see if it's in an XML document.
        /// </param>
        /// <returns type="Boolean" />

        // documentElement is verified for cases where it doesn't yet exist
        // (such as loading iframes in IE - #4833)
        var documentElement = elem && (elem.ownerDocument || elem).documentElement;
        return documentElement ? documentElement.nodeName !== "HTML" : false;
    };
    jQuery.lastModified = {};
    jQuery.makeArray = function (arr, results) {
        /// <summary>
        ///     Convert an array-like object into a true JavaScript array.
        /// </summary>
        /// <param name="arr" type="PlainObject">
        ///     Any object to turn into a native Array.
        /// </param>
        /// <returns type="Array" />

        var ret = results || [];

        if (arr != null) {
            if (isArraylike(Object(arr))) {
                jQuery.merge(ret,
					typeof arr === "string" ?
					[arr] : arr
				);
            } else {
                core_push.call(ret, arr);
            }
        }

        return ret;
    };
    jQuery.map = function (elems, callback, arg) {
        /// <summary>
        ///     Translate all items in an array or object to new array of items.
        ///     &#10;1 - jQuery.map(array, callback(elementOfArray, indexInArray)) 
        ///     &#10;2 - jQuery.map(arrayOrObject, callback( value, indexOrKey ))
        /// </summary>
        /// <param name="elems" type="Array">
        ///     The Array to translate.
        /// </param>
        /// <param name="callback" type="Function">
        ///     The function to process each item against.  The first argument to the function is the array item, the second argument is the index in array The function can return any value. Within the function, this refers to the global (window) object.
        /// </param>
        /// <returns type="Array" />

        var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike(elems),
			ret = [];

        // Go through the array, translating each of the items to their
        if (isArray) {
            for (; i < length; i++) {
                value = callback(elems[i], i, arg);

                if (value != null) {
                    ret[ret.length] = value;
                }
            }

            // Go through every key on the object,
        } else {
            for (i in elems) {
                value = callback(elems[i], i, arg);

                if (value != null) {
                    ret[ret.length] = value;
                }
            }
        }

        // Flatten any nested arrays
        return core_concat.apply([], ret);
    };
    jQuery.merge = function (first, second) {
        /// <summary>
        ///     Merge the contents of two arrays together into the first array.
        /// </summary>
        /// <param name="first" type="Array">
        ///     The first array to merge, the elements of second added.
        /// </param>
        /// <param name="second" type="Array">
        ///     The second array to merge into the first, unaltered.
        /// </param>
        /// <returns type="Array" />

        var l = second.length,
			i = first.length,
			j = 0;

        if (typeof l === "number") {
            for (; j < l; j++) {
                first[i++] = second[j];
            }
        } else {
            while (second[j] !== undefined) {
                first[i++] = second[j++];
            }
        }

        first.length = i;

        return first;
    };
    jQuery.noConflict = function (deep) {
        /// <summary>
        ///     Relinquish jQuery's control of the $ variable.
        /// </summary>
        /// <param name="deep" type="Boolean">
        ///     A Boolean indicating whether to remove all jQuery variables from the global scope (including jQuery itself).
        /// </param>
        /// <returns type="Object" />

        if (window.$ === jQuery) {
            window.$ = _$;
        }

        if (deep && window.jQuery === jQuery) {
            window.jQuery = _jQuery;
        }

        return jQuery;
    };
    jQuery.nodeName = function (elem, name) {

        return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
    };
    jQuery.noop = function () {
        /// <summary>
        ///     An empty function.
        /// </summary>
        /// <returns type="undefined" />
    };
    jQuery.offset = {};
    jQuery.param = function (a, traditional) {
        /// <summary>
        ///     Create a serialized representation of an array or object, suitable for use in a URL query string or Ajax request.
        ///     &#10;1 - jQuery.param(obj) 
        ///     &#10;2 - jQuery.param(obj, traditional)
        /// </summary>
        /// <param name="a" type="">
        ///     An array or object to serialize.
        /// </param>
        /// <param name="traditional" type="Boolean">
        ///     A Boolean indicating whether to perform a traditional "shallow" serialization.
        /// </param>
        /// <returns type="String" />

        var prefix,
            s = [],
            add = function (key, value) {
                // If value is a function, invoke it and return its value
                value = jQuery.isFunction(value) ? value() : (value == null ? "" : value);
                s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
            };

        // Set traditional to true for jQuery <= 1.3.2 behavior.
        if (traditional === undefined) {
            traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
        }

        // If an array was passed in, assume that it is an array of form elements.
        if (jQuery.isArray(a) || (a.jquery && !jQuery.isPlainObject(a))) {
            // Serialize the form elements
            jQuery.each(a, function () {
                add(this.name, this.value);
            });

        } else {
            // If traditional, encode the "old" way (the way 1.3.2 or older
            // did it), otherwise encode params recursively.
            for (prefix in a) {
                buildParams(prefix, a[prefix], traditional, add);
            }
        }

        // Return the resulting serialization
        return s.join("&").replace(r20, "+");
    };
    jQuery.parseHTML = function (data, context, keepScripts) {
        /// <summary>
        ///     Parses a string into an array of DOM nodes.
        /// </summary>
        /// <param name="data" type="String">
        ///     HTML string to be parsed
        /// </param>
        /// <param name="context" domElement="true">
        ///     DOM element to serve as the context in which the HTML fragment will be created
        /// </param>
        /// <param name="keepScripts" type="Boolean">
        ///     A Boolean indicating whether to include scripts passed in the HTML string
        /// </param>
        /// <returns type="Array" />

        if (!data || typeof data !== "string") {
            return null;
        }
        if (typeof context === "boolean") {
            keepScripts = context;
            context = false;
        }
        context = context || document;

        var parsed = rsingleTag.exec(data),
			scripts = !keepScripts && [];

        // Single tag
        if (parsed) {
            return [context.createElement(parsed[1])];
        }

        parsed = jQuery.buildFragment([data], context, scripts);

        if (scripts) {
            jQuery(scripts).remove();
        }

        return jQuery.merge([], parsed.childNodes);
    };
    jQuery.parseXML = function (data) {
        /// <summary>
        ///     Parses a string into an XML document.
        /// </summary>
        /// <param name="data" type="String">
        ///     a well-formed XML string to be parsed
        /// </param>
        /// <returns type="XMLDocument" />

        var xml, tmp;
        if (!data || typeof data !== "string") {
            return null;
        }

        // Support: IE9
        try {
            tmp = new DOMParser();
            xml = tmp.parseFromString(data, "text/xml");
        } catch (e) {
            xml = undefined;
        }

        if (!xml || xml.getElementsByTagName("parsererror").length) {
            jQuery.error("Invalid XML: " + data);
        }
        return xml;
    };
    jQuery.post = function (url, data, callback, type) {
        /// <summary>
        ///     Load data from the server using a HTTP POST request.
        /// </summary>
        /// <param name="url" type="String">
        ///     A string containing the URL to which the request is sent.
        /// </param>
        /// <param name="data" type="">
        ///     A plain object or string that is sent to the server with the request.
        /// </param>
        /// <param name="callback" type="Function">
        ///     A callback function that is executed if the request succeeds.
        /// </param>
        /// <param name="type" type="String">
        ///     The type of data expected from the server. Default: Intelligent Guess (xml, json, script, text, html).
        /// </param>

        // shift arguments if data argument was omitted
        if (jQuery.isFunction(data)) {
            type = type || callback;
            callback = data;
            data = undefined;
        }

        return jQuery.ajax({
            url: url,
            type: method,
            dataType: type,
            data: data,
            success: callback
        });
    };
    jQuery.prop = function (elem, name, value) {

        var ret, hooks, notxml,
			nType = elem.nodeType;

        // don't get/set properties on text, comment and attribute nodes
        if (!elem || nType === 3 || nType === 8 || nType === 2) {
            return;
        }

        notxml = nType !== 1 || !jQuery.isXMLDoc(elem);

        if (notxml) {
            // Fix name and attach hooks
            name = jQuery.propFix[name] || name;
            hooks = jQuery.propHooks[name];
        }

        if (value !== undefined) {
            return hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined ?
                ret :
				(elem[name] = value);

        } else {
            return hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null ?
                ret :
				elem[name];
        }
    };
    jQuery.propFix = {
        "for": 'htmlFor',
        "class": 'className',
        "tabindex": {},
        "readonly": {},
        "maxlength": {},
        "cellspacing": {},
        "cellpadding": {},
        "rowspan": {},
        "colspan": {},
        "usemap": {},
        "frameborder": {},
        "contenteditable": {}
    };
    jQuery.propHooks = { "tabIndex": {} };
    jQuery.proxy = function (fn, context) {
        /// <summary>
        ///     Takes a function and returns a new one that will always have a particular context.
        ///     &#10;1 - jQuery.proxy(function, context) 
        ///     &#10;2 - jQuery.proxy(context, name) 
        ///     &#10;3 - jQuery.proxy(function, context, additionalArguments) 
        ///     &#10;4 - jQuery.proxy(context, name, additionalArguments)
        /// </summary>
        /// <param name="fn" type="Function">
        ///     The function whose context will be changed.
        /// </param>
        /// <param name="context" type="PlainObject">
        ///     The object to which the context (this) of the function should be set.
        /// </param>
        /// <param name="" type="Anything">
        ///     Any number of arguments to be passed to the function referenced in the function argument.
        /// </param>
        /// <returns type="Function" />

        var tmp, args, proxy;

        if (typeof context === "string") {
            tmp = fn[context];
            context = fn;
            fn = tmp;
        }

        // Quick check to determine if target is callable, in the spec
        // this throws a TypeError, but we will just return undefined.
        if (!jQuery.isFunction(fn)) {
            return undefined;
        }

        // Simulated bind
        args = core_slice.call(arguments, 2);
        proxy = function () {
            return fn.apply(context || this, args.concat(core_slice.call(arguments)));
        };

        // Set the guid of unique handler to the same of original handler, so it can be removed
        proxy.guid = fn.guid = fn.guid || jQuery.guid++;

        return proxy;
    };
    jQuery.queue = function (elem, type, data) {
        /// <summary>
        ///     1: Show the queue of functions to be executed on the matched element.
        ///     &#10;    1.1 - jQuery.queue(element, queueName)
        ///     &#10;2: Manipulate the queue of functions to be executed on the matched element.
        ///     &#10;    2.1 - jQuery.queue(element, queueName, newQueue) 
        ///     &#10;    2.2 - jQuery.queue(element, queueName, callback())
        /// </summary>
        /// <param name="elem" domElement="true">
        ///     A DOM element where the array of queued functions is attached.
        /// </param>
        /// <param name="type" type="String">
        ///     A string containing the name of the queue. Defaults to fx, the standard effects queue.
        /// </param>
        /// <param name="data" type="Array">
        ///     An array of functions to replace the current queue contents.
        /// </param>
        /// <returns type="jQuery" />

        var queue;

        if (elem) {
            type = (type || "fx") + "queue";
            queue = data_priv.get(elem, type);

            // Speed up dequeue by getting out quickly if this is just a lookup
            if (data) {
                if (!queue || jQuery.isArray(data)) {
                    queue = data_priv.access(elem, type, jQuery.makeArray(data));
                } else {
                    queue.push(data);
                }
            }
            return queue || [];
        }
    };
    jQuery.ready = function (wait) {


        // Abort if there are pending holds or we're already ready
        if (wait === true ? --jQuery.readyWait : jQuery.isReady) {
            return;
        }

        // Remember that the DOM is ready
        jQuery.isReady = true;

        // If a normal DOM Ready event fired, decrement, and wait if need be
        if (wait !== true && --jQuery.readyWait > 0) {
            return;
        }

        // If there are functions bound, to execute
        readyList.resolveWith(document, [jQuery]);

        // Trigger any bound ready events
        if (jQuery.fn.trigger) {
            jQuery(document).trigger("ready").off("ready");
        }
    };
    jQuery.readyWait = 0;
    jQuery.removeAttr = function (elem, value) {

        var name, propName,
			i = 0,
			attrNames = value && value.match(core_rnotwhite);

        if (attrNames && elem.nodeType === 1) {
            while ((name = attrNames[i++])) {
                propName = jQuery.propFix[name] || name;

                // Boolean attributes get special treatment (#10870)
                if (jQuery.expr.match.boolean.test(name)) {
                    // Set corresponding property to false
                    elem[propName] = false;
                }

                elem.removeAttribute(name);
            }
        }
    };
    jQuery.removeData = function (elem, name) {
        /// <summary>
        ///     Remove a previously-stored piece of data.
        /// </summary>
        /// <param name="elem" domElement="true">
        ///     A DOM element from which to remove data.
        /// </param>
        /// <param name="name" type="String">
        ///     A string naming the piece of data to remove.
        /// </param>
        /// <returns type="jQuery" />

        data_user.remove(elem, name);
    };
    jQuery.removeEvent = function (elem, type, handle) {

        if (elem.removeEventListener) {
            elem.removeEventListener(type, handle, false);
        }
    };
    jQuery.sibling = function (n, elem) {

        var matched = [];

        for (; n; n = n.nextSibling) {
            if (n.nodeType === 1 && n !== elem) {
                matched.push(n);
            }
        }

        return matched;
    };
    jQuery.speed = function (speed, easing, fn) {

        var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
            complete: fn || !fn && easing ||
                jQuery.isFunction(speed) && speed,
            duration: speed,
            easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
        };

        opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
            opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;

        // normalize opt.queue - true/undefined/null -> "fx"
        if (opt.queue == null || opt.queue === true) {
            opt.queue = "fx";
        }

        // Queueing
        opt.old = opt.complete;

        opt.complete = function () {
            if (jQuery.isFunction(opt.old)) {
                opt.old.call(this);
            }

            if (opt.queue) {
                jQuery.dequeue(this, opt.queue);
            }
        };

        return opt;
    };
    jQuery.style = function (elem, name, value, extra) {

        // Don't set styles on text and comment nodes
        if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
            return;
        }

        // Make sure that we're working with the right name
        var ret, type, hooks,
			origName = jQuery.camelCase(name),
			style = elem.style;

        name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(style, origName));

        // gets hook for the prefixed version
        // followed by the unprefixed version
        hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];

        // Check if we're setting a value
        if (value !== undefined) {
            type = typeof value;

            // convert relative number strings (+= or -=) to relative numbers. #7345
            if (type === "string" && (ret = rrelNum.exec(value))) {
                value = (ret[1] + 1) * ret[2] + parseFloat(jQuery.css(elem, name));
                // Fixes bug #9237
                type = "number";
            }

            // Make sure that NaN and null values aren't set. See: #7116
            if (value == null || type === "number" && isNaN(value)) {
                return;
            }

            // If a number was passed in, add 'px' to the (except for certain CSS properties)
            if (type === "number" && !jQuery.cssNumber[origName]) {
                value += "px";
            }

            // Fixes #8908, it can be done more correctly by specifying setters in cssHooks,
            // but it would mean to define eight (for every problematic property) identical functions
            if (!jQuery.support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
                style[name] = "inherit";
            }

            // If a hook was provided, use that value, otherwise just set the specified value
            if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {
                style[name] = value;
            }

        } else {
            // If a hook was provided get the non-computed value from there
            if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {
                return ret;
            }

            // Otherwise just get the value from the style object
            return style[name];
        }
    };
    jQuery.support = {
        "checkOn": true,
        "optSelected": true,
        "reliableMarginRight": true,
        "boxSizingReliable": true,
        "pixelPosition": false,
        "noCloneChecked": true,
        "optDisabled": true,
        "radioValue": true,
        "checkClone": true,
        "focusinBubbles": false,
        "clearCloneStyle": true,
        "cors": true,
        "ajax": true,
        "boxSizing": true
    };
    jQuery.swap = function (elem, options, callback, args) {

        var ret, name,
			old = {};

        // Remember the old values, and insert the new ones
        for (name in options) {
            old[name] = elem.style[name];
            elem.style[name] = options[name];
        }

        ret = callback.apply(elem, args || []);

        // Revert the old values
        for (name in options) {
            elem.style[name] = old[name];
        }

        return ret;
    };
    jQuery.text = function (elem) {

        var node,
            ret = "",
            i = 0,
            nodeType = elem.nodeType;

        if (!nodeType) {
            // If no nodeType, this is expected to be an array
            for (; (node = elem[i]) ; i++) {
                // Do not traverse comment nodes
                ret += getText(node);
            }
        } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
            // Use textContent for elements
            // innerText usage removed for consistency of new lines (see #11153)
            if (typeof elem.textContent === "string") {
                return elem.textContent;
            } else {
                // Traverse its children
                for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                    ret += getText(elem);
                }
            }
        } else if (nodeType === 3 || nodeType === 4) {
            return elem.nodeValue;
        }
        // Do not include comment or processing instruction nodes

        return ret;
    };
    jQuery.trim = function (text) {
        /// <summary>
        ///     Remove the whitespace from the beginning and end of a string.
        /// </summary>
        /// <param name="text" type="String">
        ///     The string to trim.
        /// </param>
        /// <returns type="String" />

        return text == null ? "" : core_trim.call(text);
    };
    jQuery.type = function (obj) {
        /// <summary>
        ///     Determine the internal JavaScript [[Class]] of an object.
        /// </summary>
        /// <param name="obj" type="PlainObject">
        ///     Object to get the internal JavaScript [[Class]] of.
        /// </param>
        /// <returns type="String" />

        if (obj == null) {
            return String(obj);
        }
        // Support: Safari <= 5.1 (functionish RegExp)
        return typeof obj === "object" || typeof obj === "function" ?
			class2type[core_toString.call(obj)] || "object" :
			typeof obj;
    };
    jQuery.unique = function (results) {
        /// <summary>
        ///     Sorts an array of DOM elements, in place, with the duplicates removed. Note that this only works on arrays of DOM elements, not strings or numbers.
        /// </summary>
        /// <param name="results" type="Array">
        ///     The Array of DOM elements.
        /// </param>
        /// <returns type="Array" />

        var elem,
            duplicates = [],
            j = 0,
            i = 0;

        // Unless we *know* we can detect duplicates, assume their presence
        hasDuplicate = !support.detectDuplicates;
        sortInput = !support.sortStable && results.slice(0);
        results.sort(sortOrder);

        if (hasDuplicate) {
            while ((elem = results[i++])) {
                if (elem === results[i]) {
                    j = duplicates.push(i);
                }
            }
            while (j--) {
                results.splice(duplicates[j], 1);
            }
        }

        return results;
    };
    jQuery.valHooks = {
        "option": {},
        "select": {},
        "radio": {},
        "checkbox": {}
    };
    jQuery.when = function (subordinate /* , ..., subordinateN */) {
        /// <summary>
        ///     Provides a way to execute callback functions based on one or more objects, usually Deferred objects that represent asynchronous events.
        /// </summary>
        /// <param name="subordinate/*" type="Deferred">
        ///     One or more Deferred objects, or plain JavaScript objects.
        /// </param>
        /// <returns type="Promise" />

        var i = 0,
			resolveValues = core_slice.call(arguments),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || (subordinate && jQuery.isFunction(subordinate.promise)) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function (i, contexts, values) {
			    return function (value) {
			        contexts[i] = this;
			        values[i] = arguments.length > 1 ? core_slice.call(arguments) : value;
			        if (values === progressValues) {
			            deferred.notifyWith(contexts, values);
			        } else if (!(--remaining)) {
			            deferred.resolveWith(contexts, values);
			        }
			    };
			},

			progressValues, progressContexts, resolveContexts;

        // add listeners to Deferred subordinates; treat others as resolved
        if (length > 1) {
            progressValues = new Array(length);
            progressContexts = new Array(length);
            resolveContexts = new Array(length);
            for (; i < length; i++) {
                if (resolveValues[i] && jQuery.isFunction(resolveValues[i].promise)) {
                    resolveValues[i].promise()
						.done(updateFunc(i, resolveContexts, resolveValues))
						.fail(deferred.reject)
						.progress(updateFunc(i, progressContexts, progressValues));
                } else {
                    --remaining;
                }
            }
        }

        // if we're not waiting on anything, resolve the master
        if (!remaining) {
            deferred.resolveWith(resolveContexts, resolveValues);
        }

        return deferred.promise();
    };
    jQuery.Event.prototype.isDefaultPrevented = function returnFalse() {
        /// <summary>
        ///     Returns whether event.preventDefault() was ever called on this event object.
        /// </summary>
        /// <returns type="Boolean" />

        return false;
    };
    jQuery.Event.prototype.isImmediatePropagationStopped = function returnFalse() {
        /// <summary>
        ///     Returns whether event.stopImmediatePropagation() was ever called on this event object.
        /// </summary>
        /// <returns type="Boolean" />

        return false;
    };
    jQuery.Event.prototype.isPropagationStopped = function returnFalse() {
        /// <summary>
        ///     Returns whether event.stopPropagation() was ever called on this event object.
        /// </summary>
        /// <returns type="Boolean" />

        return false;
    };
    jQuery.Event.prototype.preventDefault = function () {
        /// <summary>
        ///     If this method is called, the default action of the event will not be triggered.
        /// </summary>
        /// <returns type="undefined" />

        var e = this.originalEvent;

        this.isDefaultPrevented = returnTrue;

        if (e && e.preventDefault) {
            e.preventDefault();
        }
    };
    jQuery.Event.prototype.stopImmediatePropagation = function () {
        /// <summary>
        ///     Keeps the rest of the handlers from being executed and prevents the event from bubbling up the DOM tree.
        /// </summary>

        this.isImmediatePropagationStopped = returnTrue;
        this.stopPropagation();
    };
    jQuery.Event.prototype.stopPropagation = function () {
        /// <summary>
        ///     Prevents the event from bubbling up the DOM tree, preventing any parent handlers from being notified of the event.
        /// </summary>

        var e = this.originalEvent;

        this.isPropagationStopped = returnTrue;

        if (e && e.stopPropagation) {
            e.stopPropagation();
        }
    };
    jQuery.prototype.add = function (selector, context) {
        /// <summary>
        ///     Add elements to the set of matched elements.
        ///     &#10;1 - add(selector) 
        ///     &#10;2 - add(elements) 
        ///     &#10;3 - add(html) 
        ///     &#10;4 - add(jQuery object) 
        ///     &#10;5 - add(selector, context)
        /// </summary>
        /// <param name="selector" type="String">
        ///     A string representing a selector expression to find additional elements to add to the set of matched elements.
        /// </param>
        /// <param name="context" domElement="true">
        ///     The point in the document at which the selector should begin matching; similar to the context argument of the $(selector, context) method.
        /// </param>
        /// <returns type="jQuery" />

        var set = typeof selector === "string" ?
				jQuery(selector, context) :
				jQuery.makeArray(selector && selector.nodeType ? [selector] : selector),
			all = jQuery.merge(this.get(), set);

        return this.pushStack(jQuery.unique(all));
    };
    jQuery.prototype.addBack = function (selector) {
        /// <summary>
        ///     Add the previous set of elements on the stack to the current set, optionally filtered by a selector.
        /// </summary>
        /// <param name="selector" type="String">
        ///     A string containing a selector expression to match the current set of elements against.
        /// </param>
        /// <returns type="jQuery" />

        return this.add(selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
    };
    jQuery.prototype.addClass = function (value) {
        /// <summary>
        ///     Adds the specified class(es) to each of the set of matched elements.
        ///     &#10;1 - addClass(className) 
        ///     &#10;2 - addClass(function(index, currentClass))
        /// </summary>
        /// <param name="value" type="String">
        ///     One or more space-separated classes to be added to the class attribute of each matched element.
        /// </param>
        /// <returns type="jQuery" />

        var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = typeof value === "string" && value;

        if (jQuery.isFunction(value)) {
            return this.each(function (j) {
                jQuery(this).addClass(value.call(this, j, this.className));
            });
        }

        if (proceed) {
            // The disjunction here is for better compressibility (see removeClass)
            classes = (value || "").match(core_rnotwhite) || [];

            for (; i < len; i++) {
                elem = this[i];
                cur = elem.nodeType === 1 && (elem.className ?
					(" " + elem.className + " ").replace(rclass, " ") :
					" "
				);

                if (cur) {
                    j = 0;
                    while ((clazz = classes[j++])) {
                        if (cur.indexOf(" " + clazz + " ") < 0) {
                            cur += clazz + " ";
                        }
                    }
                    elem.className = jQuery.trim(cur);

                }
            }
        }

        return this;
    };
    jQuery.prototype.after = function () {
        /// <summary>
        ///     Insert content, specified by the parameter, after each element in the set of matched elements.
        ///     &#10;1 - after(content, content) 
        ///     &#10;2 - after(function(index))
        /// </summary>
        /// <param name="" type="">
        ///     HTML string, DOM element, or jQuery object to insert after each element in the set of matched elements.
        /// </param>
        /// <param name="" type="">
        ///     One or more additional DOM elements, arrays of elements, HTML strings, or jQuery objects to insert after each element in the set of matched elements.
        /// </param>
        /// <returns type="jQuery" />

        return this.domManip(arguments, function (elem) {
            if (this.parentNode) {
                this.parentNode.insertBefore(elem, this.nextSibling);
            }
        });
    };
    jQuery.prototype.ajaxComplete = function (fn) {
        /// <summary>
        ///     Register a handler to be called when Ajax requests complete. This is an AjaxEvent.
        /// </summary>
        /// <param name="fn" type="Function">
        ///     The function to be invoked.
        /// </param>
        /// <returns type="jQuery" />

        return this.on(type, fn);
    };
    jQuery.prototype.ajaxError = function (fn) {
        /// <summary>
        ///     Register a handler to be called when Ajax requests complete with an error. This is an Ajax Event.
        /// </summary>
        /// <param name="fn" type="Function">
        ///     The function to be invoked.
        /// </param>
        /// <returns type="jQuery" />

        return this.on(type, fn);
    };
    jQuery.prototype.ajaxSend = function (fn) {
        /// <summary>
        ///     Attach a function to be executed before an Ajax request is sent. This is an Ajax Event.
        /// </summary>
        /// <param name="fn" type="Function">
        ///     The function to be invoked.
        /// </param>
        /// <returns type="jQuery" />

        return this.on(type, fn);
    };
    jQuery.prototype.ajaxStart = function (fn) {
        /// <summary>
        ///     Register a handler to be called when the first Ajax request begins. This is an Ajax Event.
        /// </summary>
        /// <param name="fn" type="Function">
        ///     The function to be invoked.
        /// </param>
        /// <returns type="jQuery" />

        return this.on(type, fn);
    };
    jQuery.prototype.ajaxStop = function (fn) {
        /// <summary>
        ///     Register a handler to be called when all Ajax requests have completed. This is an Ajax Event.
        /// </summary>
        /// <param name="fn" type="Function">
        ///     The function to be invoked.
        /// </param>
        /// <returns type="jQuery" />

        return this.on(type, fn);
    };
    jQuery.prototype.ajaxSuccess = function (fn) {
        /// <summary>
        ///     Attach a function to be executed whenever an Ajax request completes successfully. This is an Ajax Event.
        /// </summary>
        /// <param name="fn" type="Function">
        ///     The function to be invoked.
        /// </param>
        /// <returns type="jQuery" />

        return this.on(type, fn);
    };
    jQuery.prototype.andSelf = function (selector) {
        /// <summary>
        ///     Add the previous set of elements on the stack to the current set.
        /// </summary>
        /// <returns type="jQuery" />

        return this.add(selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
    };
    jQuery.prototype.animate = function (prop, speed, easing, callback) {
        /// <summary>
        ///     Perform a custom animation of a set of CSS properties.
        ///     &#10;1 - animate(properties, duration, easing, complete) 
        ///     &#10;2 - animate(properties, options)
        /// </summary>
        /// <param name="prop" type="PlainObject">
        ///     An object of CSS properties and values that the animation will move toward.
        /// </param>
        /// <param name="speed" type="">
        ///     A string or number determining how long the animation will run.
        /// </param>
        /// <param name="easing" type="String">
        ///     A string indicating which easing function to use for the transition.
        /// </param>
        /// <param name="callback" type="Function">
        ///     A function to call once the animation is complete.
        /// </param>
        /// <returns type="jQuery" />

        var empty = jQuery.isEmptyObject(prop),
			optall = jQuery.speed(speed, easing, callback),
			doAnimation = function () {
			    // Operate on a copy of prop so per-property easing won't be lost
			    var anim = Animation(this, jQuery.extend({}, prop), optall);
			    doAnimation.finish = function () {
			        anim.stop(true);
			    };
			    // Empty animations, or finishing resolves immediately
			    if (empty || data_priv.get(this, "finish")) {
			        anim.stop(true);
			    }
			};
        doAnimation.finish = doAnimation;

        return empty || optall.queue === false ?
			this.each(doAnimation) :
			this.queue(optall.queue, doAnimation);
    };
    jQuery.prototype.append = function () {
        /// <summary>
        ///     Insert content, specified by the parameter, to the end of each element in the set of matched elements.
        ///     &#10;1 - append(content, content) 
        ///     &#10;2 - append(function(index, html))
        /// </summary>
        /// <param name="" type="">
        ///     DOM element, HTML string, or jQuery object to insert at the end of each element in the set of matched elements.
        /// </param>
        /// <param name="" type="">
        ///     One or more additional DOM elements, arrays of elements, HTML strings, or jQuery objects to insert at the end of each element in the set of matched elements.
        /// </param>
        /// <returns type="jQuery" />

        return this.domManip(arguments, function (elem) {
            if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                var target = manipulationTarget(this, elem);
                target.appendChild(elem);
            }
        });
    };
    jQuery.prototype.appendTo = function (selector) {
        /// <summary>
        ///     Insert every element in the set of matched elements to the end of the target.
        /// </summary>
        /// <param name="selector" type="">
        ///     A selector, element, HTML string, or jQuery object; the matched set of elements will be inserted at the end of the element(s) specified by this parameter.
        /// </param>
        /// <returns type="jQuery" />

        var elems,
			ret = [],
			insert = jQuery(selector),
			last = insert.length - 1,
			i = 0;

        for (; i <= last; i++) {
            elems = i === last ? this : this.clone(true);
            jQuery(insert[i])[original](elems);

            // Support: QtWebKit
            // .get() because core_push.apply(_, arraylike) throws
            core_push.apply(ret, elems.get());
        }

        return this.pushStack(ret);
    };
    jQuery.prototype.attr = function (name, value) {
        /// <summary>
        ///     1: Get the value of an attribute for the first element in the set of matched elements.
        ///     &#10;    1.1 - attr(attributeName)
        ///     &#10;2: Set one or more attributes for the set of matched elements.
        ///     &#10;    2.1 - attr(attributeName, value) 
        ///     &#10;    2.2 - attr(attributes) 
        ///     &#10;    2.3 - attr(attributeName, function(index, attr))
        /// </summary>
        /// <param name="name" type="String">
        ///     The name of the attribute to set.
        /// </param>
        /// <param name="value" type="">
        ///     A value to set for the attribute.
        /// </param>
        /// <returns type="jQuery" />

        return jQuery.access(this, jQuery.attr, name, value, arguments.length > 1);
    };
    jQuery.prototype.before = function () {
        /// <summary>
        ///     Insert content, specified by the parameter, before each element in the set of matched elements.
        ///     &#10;1 - before(content, content) 
        ///     &#10;2 - before(function)
        /// </summary>
        /// <param name="" type="">
        ///     HTML string, DOM element, or jQuery object to insert before each element in the set of matched elements.
        /// </param>
        /// <param name="" type="">
        ///     One or more additional DOM elements, arrays of elements, HTML strings, or jQuery objects to insert before each element in the set of matched elements.
        /// </param>
        /// <returns type="jQuery" />

        return this.domManip(arguments, function (elem) {
            if (this.parentNode) {
                this.parentNode.insertBefore(elem, this);
            }
        });
    };
    jQuery.prototype.bind = function (types, data, fn) {
        /// <summary>
        ///     Attach a handler to an event for the elements.
        ///     &#10;1 - bind(eventType, eventData, handler(eventObject)) 
        ///     &#10;2 - bind(eventType, eventData, preventBubble) 
        ///     &#10;3 - bind(events)
        /// </summary>
        /// <param name="types" type="String">
        ///     A string containing one or more DOM event types, such as "click" or "submit," or custom event names.
        /// </param>
        /// <param name="data" type="Object">
        ///     An object containing data that will be passed to the event handler.
        /// </param>
        /// <param name="fn" type="Function">
        ///     A function to execute each time the event is triggered.
        /// </param>
        /// <returns type="jQuery" />

        return this.on(types, null, data, fn);
    };
    jQuery.prototype.blur = function (data, fn) {
        /// <summary>
        ///     Bind an event handler to the "blur" JavaScript event, or trigger that event on an element.
        ///     &#10;1 - blur(handler(eventObject)) 
        ///     &#10;2 - blur(eventData, handler(eventObject)) 
        ///