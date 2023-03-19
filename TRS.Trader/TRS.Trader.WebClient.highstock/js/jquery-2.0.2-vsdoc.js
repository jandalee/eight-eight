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

					// If there i