/*
* This file has been generated to support Visual Studio IntelliSense.
* You should not use this file at runtime inside the browser--it is only
* intended to be used only for design-time IntelliSense.  Please use the
* standard jQuery library for all production use.
*
* Comment version: 1.6.4
*/

/*!
* jQuery JavaScript Library v1.6.4
* http://jquery.com/
*
* Distributed in whole under the terms of the MIT
*
* Copyright 2010, John Resig
*
* Permission is hereby granted, free of charge, to any person obtaining
* a copy of this software and associated documentation files (the
* "Software"), to deal in the Software without restriction, including
* without limitation the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to
* the following conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
* LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
* OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
* WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
* Includes Sizzle.js
* http://sizzlejs.com/
* Copyright 2010, The Dojo Foundation
* Released under the MIT and BSD Licenses.
*/

(function ( window, undefined ) {
var jQuery = function( selector, context ) {
/// <summary>
///     1: Accepts a string containing a CSS selector which is then used to match a set of elements.
///     <para>    1.1 - $(selector, context) </para>
///     <para>    1.2 - $(element) </para>
///     <para>    1.3 - $(elementArray) </para>
///     <para>    1.4 - $(jQuery object) </para>
///     <para>    1.5 - $()</para>
///     <para>2: Creates DOM elements on the fly from the provided string of raw HTML.</para>
///     <para>    2.1 - $(html, ownerDocument) </para>
///     <para>    2.2 - $(html, props)</para>
///     <para>3: Binds a function to be executed when the DOM has finished loading.</para>
///     <para>    3.1 - $(callback)</para>
/// </summary>
/// <param name="selector" type="String">
///     A string containing a selector expression
/// </param>
/// <param name="context" type="jQuery">
///     A DOM Element, Document, or jQuery to use as context
/// </param>
/// <returns type="jQuery" />

		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	};
jQuery.Deferred = function( func ) {

		var deferred = jQuery._Deferred(),
			failDeferred = jQuery._Deferred(),
			promise;
		// Add errorDeferred methods, then and promise
		jQuery.extend( deferred, {
			then: function( doneCallbacks, failCallbacks ) {
				deferred.done( doneCallbacks ).fail( failCallbacks );
				return this;
			},
			always: function() {
				return deferred.done.apply( deferred, arguments ).fail.apply( this, arguments );
			},
			fail: failDeferred.done,
			rejectWith: failDeferred.resolveWith,
			reject: failDeferred.resolve,
			isRejected: failDeferred.isResolved,
			pipe: function( fnDone, fnFail ) {
				return jQuery.Deferred(function( newDefer ) {
					jQuery.each( {
						done: [ fnDone, "resolve" ],
						fail: [ fnFail, "reject" ]
					}, function( handler, data ) {
						var fn = data[ 0 ],
							action = data[ 1 ],
							returned;
						if ( jQuery.isFunction( fn ) ) {
							deferred[ handler ](function() {
								returned = fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise().then( newDefer.resolve, newDefer.reject );
								} else {
									newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
								}
							});
						} else {
							deferred[ handler ]( newDefer[ action ] );
						}
					});
				}).promise();
			},
			// Get a promise for this deferred
			// If obj is provided, the promise aspect is added to the object
			promise: function( obj ) {
				if ( obj == null ) {
					if ( promise ) {
						return promise;
					}
					promise = obj = {};
				}
				var i = promiseMethods.length;
				while( i-- ) {
					obj[ promiseMethods[i] ] = deferred[ promiseMethods[i] ];
				}
				return obj;
			}
		});
		// Make sure only one callback list will be used
		deferred.done( failDeferred.cancel ).fail( deferred.cancel );
		// Unexpose cancel
		delete deferred.cancel;
		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}
		return deferred;
	};
jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !this.preventDefault ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = (src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault()) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// timeStamp is buggy for some events on Firefox(#3843)
	// So we won't rely on the native value
	this.timeStamp = jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};
jQuery._Deferred = function() {

		var // callbacks list
			callbacks = [],
			// stored [ context , args ]
			fired,
			// to avoid firing when already doing so
			firing,
			// flag to know if the deferred has been cancelled
			cancelled,
			// the deferred itself
			deferred  = {

				// done( f1, f2, ...)
				done: function() {
					if ( !cancelled ) {
						var args = arguments,
							i,
							length,
							elem,
							type,
							_fired;
						if ( fired ) {
							_fired = fired;
							fired = 0;
						}
						for ( i = 0, length = args.length; i < length; i++ ) {
							elem = args[ i ];
							type = jQuery.type( elem );
							if ( type === "array" ) {
								deferred.done.apply( deferred, elem );
							} else if ( type === "function" ) {
								callbacks.push( elem );
							}
						}
						if ( _fired ) {
							deferred.resolveWith( _fired[ 0 ], _fired[ 1 ] );
						}
					}
					return this;
				},

				// resolve with given context and args
				resolveWith: function( context, args ) {
					if ( !cancelled && !fired && !firing ) {
						// make sure args are available (#8421)
						args = args || [];
						firing = 1;
						try {
							while( callbacks[ 0 ] ) {
								callbacks.shift().apply( context, args );
							}
						}
						finally {
							fired = [ context, args ];
							firing = 0;
						}
					}
					return this;
				},

				// resolve with this as context and given arguments
				resolve: function() {
					deferred.resolveWith( this, arguments );
					return this;
				},

				// Has this deferred been resolved?
				isResolved: function() {
					return !!( firing || fired );
				},

				// Cancel
				cancel: function() {
					cancelled = 1;
					callbacks = [];
					return this;
				}
			};

		return deferred;
	};
jQuery._data = function( elem, name, data ) {

		return jQuery.data( elem, name, data, true );
	};
jQuery._mark = function( elem, type ) {

		if ( elem ) {
			type = (type || "fx") + "mark";
			jQuery.data( elem, type, (jQuery.data(elem,type,undefined,true) || 0) + 1, true );
		}
	};
jQuery._unmark = function( force, elem, type ) {

		if ( force !== true ) {
			type = elem;
			elem = force;
			force = false;
		}
		if ( elem ) {
			type = type || "fx";
			var key = type + "mark",
				count = force ? 0 : ( (jQuery.data( elem, key, undefined, true) || 1 ) - 1 );
			if ( count ) {
				jQuery.data( elem, key, count, true );
			} else {
				jQuery.removeData( elem, key, true );
				handleQueueMarkDefer( elem, type, "mark" );
			}
		}
	};
jQuery.acceptData = function( elem ) {

		if ( elem.nodeName ) {
			var match = jQuery.noData[ elem.nodeName.toLowerCase() ];

			if ( match ) {
				return !(match === true || elem.getAttribute("classid") !== match);
			}
		}

		return true;
	};
jQuery.access = function( elems, key, value, exec, fn, pass ) {

		var length = elems.length;

		// Setting many attributes
		if ( typeof key === "object" ) {
			for ( var k in key ) {
				jQuery.access( elems, k, key[k], exec, fn, value );
			}
			return elems;
		}

		// Setting one attribute
		if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = !pass && exec && jQuery.isFunction(value);

			for ( var i = 0; i < length; i++ ) {
				fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
			}

			return elems;
		}

		// Getting an attribute
		return length ? fn( elems[0], key ) : undefined;
	};
jQuery.active = 0;
jQuery.ajax = function( url, options ) {
/// <summary>
///     Perform an asynchronous HTTP (Ajax) request.
///     <para>1 - jQuery.ajax(url, settings) </para>
///     <para>2 - jQuery.ajax(settings)</para>
/// </summary>
/// <param name="url" type="String">
///     A string containing the URL to which the request is sent.
/// </param>
/// <param name="options" type="Object">
///     A set of key/value pairs that configure the Ajax request. All settings are optional. A default can be set for any option with $.ajaxSetup(). See jQuery.ajax( settings ) below for a complete list of all settings.
/// </param>


		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events
			// It's the callbackContext if one was provided in the options
			// and if it's a DOM node or a jQuery collection
			globalEventContext = callbackContext !== s &&
				( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
						jQuery( callbackContext ) : jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery._Deferred(),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// ifModified key
			ifModifiedKey,
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// Response headers
			responseHeadersString,
			responseHeaders,
			// transport
			transport,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// The jqXHR state
			state = 0,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Fake xhr
			jqXHR = {

				readyState: 0,

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( !state ) {
						var lname = name.toLowerCase();
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match === undefined ? null : match;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					statusText = statusText || "abort";
					if ( transport ) {
						transport.abort( statusText );
					}
					done( 0, statusText );
					return this;
				}
			};

		// Callback for when everything is done
		// It is defined here because jslint complains if it is declared
		// at the end of the function (which would be more logical and readable)
		function done( status, nativeStatusText, responses, headers ) {

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			var isSuccess,
				success,
				error,
				statusText = nativeStatusText,
				response = responses ? ajaxHandleResponses( s, jqXHR, responses ) : undefined,
				lastModified,
				etag;

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {

					if ( ( lastModified = jqXHR.getResponseHeader( "Last-Modified" ) ) ) {
						jQuery.lastModified[ ifModifiedKey ] = lastModified;
					}
					if ( ( etag = jqXHR.getResponseHeader( "Etag" ) ) ) {
						jQuery.etag[ ifModifiedKey ] = etag;
					}
				}

				// If not modified
				if ( status === 304 ) {

					statusText = "notmodified";
					isSuccess = true;

				// If we have data
				} else {

					try {
						success = ajaxConvert( s, response );
						statusText = "success";
						isSuccess = true;
					} catch(e) {
						// We have a parsererror
						statusText = "parsererror";
						error = e;
					}
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if( !statusText || status ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = "" + ( nativeStatusText || statusText );

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
						[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.resolveWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		// Attach deferreds
		deferred.promise( jqXHR );
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;
		jqXHR.complete = completeDeferred.done;

		// Status-dependent callbacks
		jqXHR.statusCode = function( map ) {
			if ( map ) {
				var tmp;
				if ( state < 2 ) {
					for( tmp in map ) {
						statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
					}
				} else {
					tmp = map[ jqXHR.status ];
					jqXHR.then( tmp, tmp );
				}
			}
			return this;
		};

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// We also use the url parameter if available
		s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( rspacesAjax );

		// Determine if a cross-domain request is in order
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefiler, stop there
		if ( state === 2 ) {
			return false;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Get ifModifiedKey before adding the anti-cache parameter
			ifModifiedKey = s.url;

			// Add anti-cache in url if needed
			if ( s.cache === false ) {

				var ts = jQuery.now(),
					// try replacing _= if it is there
					ret = s.url.replace( rts, "$1_=" + ts );

				// if nothing was replaced, add timestamp to the end
				s.url = ret + ( (ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			ifModifiedKey = ifModifiedKey || s.url;
			if ( jQuery.lastModified[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
			}
			if ( jQuery.etag[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
			}
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
				// Abort if not done already
				jqXHR.abort();
				return false;

		}

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;
			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout( function(){
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch (e) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					jQuery.error( e );
				}
			}
		}

		return jqXHR;
	};
jQuery.ajaxPrefilter = function( dataTypeExpression, func ) {
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


		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		if ( jQuery.isFunction( func ) ) {
			var dataTypes = dataTypeExpression.toLowerCase().split( rspacesAjax ),
				i = 0,
				length = dataTypes.length,
				dataType,
				list,
				placeBefore;

			// For each dataType in the dataTypeExpression
			for(; i < length; i++ ) {
				dataType = dataTypes[ i ];
				// We control if we're asked to add before
				// any existing element
				placeBefore = /^\+/.test( dataType );
				if ( placeBefore ) {
					dataType = dataType.substr( 1 ) || "*";
				}
				list = structure[ dataType ] = structure[ dataType ] || [];
				// then we add to the structure accordingly
				list[ placeBefore ? "unshift" : "push" ]( func );
			}
		}
	};
jQuery.ajaxSettings = { "url": 'http://localhost:25813/?ver=1.6.4&newLineMethod=para',
"isLocal": false,
"global": true,
"type": 'GET',
"contentType": 'application/x-www-form-urlencoded',
"processData": true,
"async": true,
"accepts": {},
"contents": {},
"responseFields": {},
"converters": {},
"flatOptions": {},
"jsonp": 'callback' };
jQuery.ajaxSetup = function( target, settings ) {
/// <summary>
///     Set default values for future Ajax requests.
/// </summary>
/// <param name="target" type="Object">
///     A set of key/value pairs that configure the default Ajax request. All options are optional.
/// </param>

		if ( settings ) {
			// Building a settings object
			ajaxExtend( target, jQuery.ajaxSettings );
		} else {
			// Extending ajaxSettings
			settings = target;
			target = jQuery.ajaxSettings;
		}
		ajaxExtend( target, settings );
		return target;
	};
jQuery.ajaxTransport = function( dataTypeExpression, func ) {


		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		if ( jQuery.isFunction( func ) ) {
			var dataTypes = dataTypeExpression.toLowerCase().split( rspacesAjax ),
				i = 0,
				length = dataTypes.length,
				dataType,
				list,
				placeBefore;

			// For each dataType in the dataTypeExpression
			for(; i < length; i++ ) {
				dataType = dataTypes[ i ];
				// We control if we're asked to add before
				// any existing element
				placeBefore = /^\+/.test( dataType );
				if ( placeBefore ) {
					dataType = dataType.substr( 1 ) || "*";
				}
				list = structure[ dataType ] = structure[ dataType ] || [];
				// then we add to the structure accordingly
				list[ placeBefore ? "unshift" : "push" ]( func );
			}
		}
	};
jQuery.attr = function( elem, name, value, pass ) {

		var nType = elem.nodeType;
		
		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return undefined;
		}

		if ( pass && name in jQuery.attrFn ) {
			return jQuery( elem )[ name ]( value );
		}

		// Fallback to prop when attributes are not supported
		if ( !("getAttribute" in elem) ) {
			return jQuery.prop( elem, name, value );
		}

		var ret, hooks,
			notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// Normalize the name if needed
		if ( notxml ) {
			name = jQuery.attrFix[ name ] || name;

			hooks = jQuery.attrHooks[ name ];

			if ( !hooks ) {
				// Use boolHook for boolean attributes
				if ( rboolean.test( name ) ) {
					hooks = boolHook;

				// Use nodeHook if available( IE6/7 )
				} else if ( nodeHook ) {
					hooks = nodeHook;
				}
			}
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return undefined;

			} else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, "" + value );
				return value;
			}

		} else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			ret = elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return ret === null ?
				undefined :
				ret;
		}
	};
jQuery.attrFix = { "tabindex": 'tabIndex' };
jQuery.attrFn = { "val": true,
"css": true,
"html": true,
"text": true,
"data": true,
"width": true,
"height": true,
"offset": true,
"blur": true,
"focus": true,
"focusin": true,
"focusout": true,
"load": true,
"resize": true,
"scroll": true,
"unload": true,
"click": true,
"dblclick": true,
"mousedown": true,
"mouseup": true,
"mousemove": true,
"mouseover": true,
"mouseout": true,
"mouseenter": true,
"mouseleave": true,
"change": true,
"select": true,
"submit": true,
"keydown": true,
"keypress": true,
"keyup": true,
"error": true };
jQuery.attrHooks = { "type": {},
"value": {},
"tabIndex": {} };
jQuery.bindReady = function() {

		if ( readyList ) {
			return;
		}

		readyList = jQuery._Deferred();

		// Catch cases where $(document).ready() is called after the
		// browser event has already occurred.
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			return setTimeout( jQuery.ready, 1 );
		}

		// Mozilla, Opera and webkit nightlies currently support this event
		if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", jQuery.ready, false );

		// If IE event model is used
		} else if ( document.attachEvent ) {
			// ensure firing before onload,
			// maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", DOMContentLoaded );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", jQuery.ready );

			// If IE and not a frame
			// continually check to see if the document is ready
			var toplevel = false;

			try {
				toplevel = window.frameElement == null;
			} catch(e) {}

			if ( document.documentElement.doScroll && toplevel ) {
				doScrollCheck();
			}
		}
	};
jQuery.boxModel = true;
jQuery.browser = { "msie": true,
"version": '9.0' };
jQuery.buildFragment = function( args, nodes, scripts ) {

	var fragment, cacheable, cacheresults, doc;

  // nodes may contain either an explicit document object,
  // a jQuery collection or context object.
  // If nodes[0] contains a valid object to assign to doc
  if ( nodes && nodes[0] ) {
    doc = nodes[0].ownerDocument || nodes[0];
  }

  // Ensure that an attr object doesn't incorrectly stand in as a document object
	// Chrome and Firefox seem to allow this to occur and will throw exception
	// Fixes #8950
	if ( !doc.createDocumentFragment ) {
		doc = document;
	}

	// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
	// Cloning options loses the selected state, so don't cache them
	// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
	// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
	if ( args.length === 1 && typeof args[0] === "string" && args[0].length < 512 && doc === document &&
		args[0].charAt(0) === "<" && !rnocache.test( args[0] ) && (jQuery.support.checkClone || !rchecked.test( args[0] )) ) {

		cacheable = true;

		cacheresults = jQuery.fragments[ args[0] ];
		if ( cacheresults && cacheresults !== 1 ) {
			fragment = cacheresults;
		}
	}

	if ( !fragment ) {
		fragment = doc.createDocumentFragment();
		jQuery.clean( args, doc, fragment, scripts );
	}

	if ( cacheable ) {
		jQuery.fragments[ args[0] ] = cacheresults ? fragment : 1;
	}

	return { fragment: fragment, cacheable: cacheable };
};
jQuery.cache = {};
jQuery.camelCase = function( string ) {

		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	};
jQuery.clean = function( elems, context, fragment, scripts ) {

		var checkScriptType;

		context = context || document;

		// !context.createElement fails in IE with an error but returns typeof 'object'
		if ( typeof context.createElement === "undefined" ) {
			context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
		}

		var ret = [], j;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( typeof elem === "number" ) {
				elem += "";
			}

			if ( !elem ) {
				continue;
			}

			// Convert html string into DOM nodes
			if ( typeof elem === "string" ) {
				if ( !rhtml.test( elem ) ) {
					elem = context.createTextNode( elem );
				} else {
					// Fix "XHTML"-style tags in all browsers
					elem = elem.replace(rxhtmlTag, "<$1></$2>");

					// Trim whitespace, otherwise indexOf won't work as expected
					var tag = (rtagName.exec( elem ) || ["", ""])[1].toLowerCase(),
						wrap = wrapMap[ tag ] || wrapMap._default,
						depth = wrap[0],
						div = context.createElement("div");

					// Go to html and back, then peel off extra wrappers
					div.innerHTML = wrap[1] + elem + wrap[2];

					// Move to the right depth
					while ( depth-- ) {
						div = div.lastChild;
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						var hasBody = rtbody.test(elem),
							tbody = tag === "table" && !hasBody ?
								div.firstChild && div.firstChild.childNodes :

								// String was a bare <thead> or <tfoot>
								wrap[1] === "<table>" && !hasBody ?
									div.childNodes :
									[];

						for ( j = tbody.length - 1; j >= 0 ; --j ) {
							if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
								tbody[ j ].parentNode.removeChild( tbody[ j ] );
							}
						}
					}

					// IE completely kills leading whitespace when innerHTML is used
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
					}

					elem = div.childNodes;
				}
			}

			// Resets defaultChecked for any radios and checkboxes
			// about to be appended to the DOM in IE 6/7 (#8060)
			var len;
			if ( !jQuery.support.appendChecked ) {
				if ( elem[0] && typeof (len = elem.length) === "number" ) {
					for ( j = 0; j < len; j++ ) {
						findInputs( elem[j] );
					}
				} else {
					findInputs( elem );
				}
			}

			if ( elem.nodeType ) {
				ret.push( elem );
			} else {
				ret = jQuery.merge( ret, elem );
			}
		}

		if ( fragment ) {
			checkScriptType = function( elem ) {
				return !elem.type || rscriptType.test( elem.type );
			};
			for ( i = 0; ret[i]; i++ ) {
				if ( scripts && jQuery.nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
					scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );

				} else {
					if ( ret[i].nodeType === 1 ) {
						var jsTags = jQuery.grep( ret[i].getElementsByTagName( "script" ), checkScriptType );

						ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
					}
					fragment.appendChild( ret[i] );
				}
			}
		}

		return ret;
	};
jQuery.cleanData = function( elems ) {

		var data, id, cache = jQuery.cache, internalKey = jQuery.expando, special = jQuery.event.special,
			deleteExpando = jQuery.support.deleteExpando;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
				continue;
			}

			id = elem[ jQuery.expando ];

			if ( id ) {
				data = cache[ id ] && cache[ id ][ internalKey ];

				if ( data && data.events ) {
					for ( var type in data.events ) {
						if ( special[ type ] ) {
							jQuery.event.remove( elem, type );

						// This is a shortcut to avoid jQuery.event.remove's overhead
						} else {
							jQuery.removeEvent( elem, type, data.handle );
						}
					}

					// Null the DOM reference to avoid IE6/7/8 leak (#7054)
					if ( data.handle ) {
						data.handle.elem = null;
					}
				}

				if ( deleteExpando ) {
					delete elem[ jQuery.expando ];

				} else if ( elem.removeAttribute ) {
					elem.removeAttribute( jQuery.expando );
				}

				delete cache[ id ];
			}
		}
	};
jQuery.clone = function( elem, dataAndEvents, deepDataAndEvents ) {

		var clone = elem.cloneNode(true),
				srcElements,
				destElements,
				i;

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
			// IE copies events bound via attachEvent when using cloneNode.
			// Calling detachEvent on the clone will also remove the events
			// from the original. In order to get around this, we use some
			// proprietary methods to clear the events. Thanks to MooTools
			// guys for this hotness.

			cloneFixAttributes( elem, clone );

			// Using Sizzle here is crazy slow, so we use getElementsByTagName
			// instead
			srcElements = getAll( elem );
			destElements = getAll( clone );

			// Weird iteration because IE will replace the length property
			// with an element if you are cloning the body and one of the
			// elements on the page has a name or id of "length"
			for ( i = 0; srcElements[i]; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					cloneFixAttributes( srcElements[i], destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			cloneCopyEvent( elem, clone );

			if ( deepDataAndEvents ) {
				srcElements = getAll( elem );
				destElements = getAll( clone );

				for ( i = 0; srcElements[i]; ++i ) {
					cloneCopyEvent( srcElements[i], destElements[i] );
				}
			}
		}

		srcElements = destElements = null;

		// Return the cloned set
		return clone;
	};
jQuery.contains = function( a, b ) {
/// <summary>
///     Check to see if a DOM element is within another DOM element.
/// </summary>
/// <param name="a" domElement="true">
///     The DOM element that may contain the other element.
/// </param>
/// <param name="b" domElement="true">
///     The DOM element that may be contained by the other element.
/// </param>
/// <returns type="Boolean" />

		return a !== b && (a.contains ? a.contains(b) : true);
	};
jQuery.css = function( elem, name, extra ) {

		var ret, hooks;

		// Make sure that we're working with the right name
		name = jQuery.camelCase( name );
		hooks = jQuery.cssHooks[ name ];
		name = jQuery.cssProps[ name ] || name;

		// cssFloat needs a special treatment
		if ( name === "cssFloat" ) {
			name = "float";
		}

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks && (ret = hooks.get( elem, true, extra )) !== undefined ) {
			return ret;

		// Otherwise, if a way to get the computed value exists, use that
		} else if ( curCSS ) {
			return curCSS( elem, name );
		}
	};
jQuery.cssHooks = { "opacity": {},
"height": {},
"width": {} };
jQuery.cssNumber = { "fillOpacity": true,
"fontWeight": true,
"lineHeight": true,
"opacity": true,
"orphans": true,
"widows": true,
"zIndex": true,
"zoom": true };
jQuery.cssProps = { "float": 'cssFloat' };
jQuery.curCSS = function( elem, name, extra ) {

		var ret, hooks;

		// Make sure that we're working with the right name
		name = jQuery.camelCase( name );
		hooks = jQuery.cssHooks[ name ];
		name = jQuery.cssProps[ name ] || name;

		// cssFloat needs a special treatment
		if ( name === "cssFloat" ) {
			name = "float";
		}

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks && (ret = hooks.get( elem, true, extra )) !== undefined ) {
			return ret;

		// Otherwise, if a way to get the computed value exists, use that
		} else if ( curCSS ) {
			return curCSS( elem, name );
		}
	};
jQuery.data = function( elem, name, data, pvt /* Internal Use Only */ ) {
/// <summary>
///     1: Store arbitrary data associated with the specified element. Returns the value that was set.
///     <para>    1.1 - jQuery.data(element, key, value)</para>
///     <para>2: Returns value at named data store for the element, as set by jQuery.data(element, name, value), or the full data store for the element.</para>
///     <para>    2.1 - jQuery.data(element, key) </para>
///     <para>    2.2 - jQuery.data(element)</para>
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

		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, ret,
			internalKey = jQuery.expando,
			getByName = typeof name === "string",

			// We have to handle DOM nodes and JS objects differently because IE6-7
			// can't GC object references properly across the DOM-JS boundary
			isNode = elem.nodeType,

			// Only DOM nodes need the global jQuery cache; JS object data is
			// attached directly to the object so GC can occur automatically
			cache = isNode ? jQuery.cache : elem,

			// Only defining an ID for JS objects if its cache already exists allows
			// the code to shortcut on the same path as a DOM node with no cache
			id = isNode ? elem[ jQuery.expando ] : elem[ jQuery.expando ] && jQuery.expando;

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
		if ( (!id || (pvt && id && (cache[ id ] && !cache[ id ][ internalKey ]))) && getByName && data === undefined ) {
			return;
		}

		if ( !id ) {
			// Only DOM nodes need a new unique ID for each element since their data
			// ends up in the global cache
			if ( isNode ) {
				elem[ jQuery.expando ] = id = ++jQuery.uuid;
			} else {
				id = jQuery.expando;
			}
		}

		if ( !cache[ id ] ) {
			cache[ id ] = {};

			// TODO: This is a hack for 1.5 ONLY. Avoids exposing jQuery
			// metadata on plain JS objects when the object is serialized using
			// JSON.stringify
			if ( !isNode ) {
				cache[ id ].toJSON = jQuery.noop;
			}
		}

		// An object can be passed to jQuery.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
		if ( typeof name === "object" || typeof name === "function" ) {
			if ( pvt ) {
				cache[ id ][ internalKey ] = jQuery.extend(cache[ id ][ internalKey ], name);
			} else {
				cache[ id ] = jQuery.extend(cache[ id ], name);
			}
		}

		thisCache = cache[ id ];

		// Internal jQuery data is stored in a separate object inside the object's data
		// cache in order to avoid key collisions between internal data and user-defined
		// data
		if ( pvt ) {
			if ( !thisCache[ internalKey ] ) {
				thisCache[ internalKey ] = {};
			}

			thisCache = thisCache[ internalKey ];
		}

		if ( data !== undefined ) {
			thisCache[ jQuery.camelCase( name ) ] = data;
		}

		// TODO: This is a hack for 1.5 ONLY. It will be removed in 1.6. Users should
		// not attempt to inspect the internal events object using jQuery.data, as this
		// internal data object is undocumented and subject to change.
		if ( name === "events" && !thisCache[name] ) {
			return thisCache[ internalKey ] && thisCache[ internalKey ].events;
		}

		// Check for both converted-to-camel and non-converted data property names
		// If a data property was specified
		if ( getByName ) {

			// First Try to find as-is property data
			ret = thisCache[ name ];

			// Test for null|undefined property data
			if ( ret == null ) {

				// Try to find the camelCased property
				ret = thisCache[ jQuery.camelCase( name ) ];
			}
		} else {
			ret = thisCache;
		}

		return ret;
	};
jQuery.dequeue = function( elem, type ) {
/// <summary>
///     Execute the next function on the queue for the matched element.
/// </summary>
/// <param name="elem" domElement="true">
///     A DOM element from which to remove and execute a queued function.
/// </param>
/// <param name="type" type="String">
///     A string containing the name of the queue. Defaults to fx, the standard effects queue.
/// </param>
/// <returns type="jQuery" />

		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			fn = queue.shift(),
			defer;

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
		}

		if ( fn ) {
			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift("inprogress");
			}

			fn.call(elem, function() {
				jQuery.dequeue(elem, type);
			});
		}

		if ( !queue.length ) {
			jQuery.removeData( elem, type + "queue", true );
			handleQueueMarkDefer( elem, type, "queue" );
		}
	};
jQuery.dir = function( elem, dir, until ) {

		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	};
jQuery.each = function( object, callback, args ) {
/// <summary>
///     A generic iterator function, which can be used to seamlessly iterate over both objects and arrays. Arrays and array-like objects with a length property (such as a function's arguments object) are iterated by numeric index, from 0 to length-1. Other objects are iterated via their named properties.
/// </summary>
/// <param name="object" type="Object">
///     The object or array to iterate over.
/// </param>
/// <param name="callback" type="Function">
///     The function that will be executed on every object.
/// </param>
/// <returns type="Object" />

		var name, i = 0,
			length = object.length,
			isObj = length === undefined || jQuery.isFunction( object );

		if ( args ) {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.apply( object[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( object[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
						break;
					}
				}
			}
		}

		return object;
	};
jQuery.easing = {};
jQuery.error = function( msg ) {
/// <summary>
///     Takes a string and throws an exception containing it.
/// </summary>
/// <param name="msg" type="String">
///     The message to send out.
/// </param>

		throw msg;
	};
jQuery.etag = {};
jQuery.event = { "global": {},
"customEvent": {},
"props": ['altKey','attrChange','attrName','bubbles','button','cancelable','charCode','clientX','clientY','ctrlKey','currentTarget','data','detail','eventPhase','fromElement','handler','keyCode','layerX','layerY','metaKey','newValue','offsetX','offsetY','pageX','pageY','prevValue','relatedNode','relatedTarget','screenX','screenY','shiftKey','srcElement','target','toElement','view','wheelDelta','which'],
"guid": 100000000,
"special": {},
"triggered":  false};
jQuery.expr = { "order": ['ID','CLASS','NAME','TAG'],
"match": {},
"leftMatch": {},
"attrMap": {},
"attrHandle": {},
"relative": {},
"find": {},
"preFilter": {},
"filters": {},
"setFilters": {},
"filter": {},
":": {} };
jQuery.extend = function() {
/// <summary>
///     Merge the contents of two or more objects together into the first object.
///     <para>1 - jQuery.extend(target, object1, objectN) </para>
///     <para>2 - jQuery.extend(deep, target, object1, objectN)</para>
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
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};
jQuery.filter = function( expr, elems, not ) {

		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	};
jQuery.find = function( query, context, extra, seed ) {

			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && !Sizzle.isXML(context) ) {
				// See if we find a selector to speed up
				var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
				
				if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
					// Speed-up: Sizzle("TAG")
					if ( match[1] ) {
						return makeArray( context.getElementsByTagName( query ), extra );
					
					// Speed-up: Sizzle(".CLASS")
					} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
						return makeArray( context.getElementsByClassName( match[2] ), extra );
					}
				}
				
				if ( context.nodeType === 9 ) {
					// Speed-up: Sizzle("body")
					// The body element only exists once, optimize finding it
					if ( query === "body" && context.body ) {
						return makeArray( [ context.body ], extra );
						
					// Speed-up: Sizzle("#ID")
					} else if ( match && match[3] ) {
						var elem = context.getElementById( match[3] );

						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						if ( elem && elem.parentNode ) {
							// Handle the case where IE and Opera return items
							// by name instead of ID
							if ( elem.id === match[3] ) {
								return makeArray( [ elem ], extra );
							}
							
						} else {
							return makeArray( [], extra );
						}
					}
					
					try {
						return makeArray( context.querySelectorAll(query), extra );
					} catch(qsaError) {}

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var oldContext = context,
						old = context.getAttribute( "id" ),
						nid = old || id,
						hasParent = context.parentNode,
						relativeHierarchySelector = /^\s*[+~]/.test( query );

					if ( !old ) {
						context.setAttribute( "id", nid );
					} else {
						nid = nid.replace( /'/g, "\\$&" );
					}
					if ( relativeHierarchySelector && hasParent ) {
						context = context.parentNode;
					}

					try {
						if ( !relativeHierarchySelector || hasParent ) {
							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
						}

					} catch(pseudoError) {
					} finally {
						if ( !old ) {
							oldContext.removeAttribute( "id" );
						}
					}
				}
			}
		
			return oldSizzle(query, context, extra, seed);
		};
jQuery.fn = { "selector": '',
"jquery": '1.6.4',
"length": 0 };
jQuery.fragments = {};
jQuery.fx = function( elem, options, prop ) {

		this.options = options;
		this.elem = elem;
		this.prop = prop;

		options.orig = options.orig || {};
	};
jQuery.get = function( url, data, callback, type ) {
/// <summary>
///     Load data from the server using a HTTP GET request.
/// </summary>
/// <param name="url" type="String">
///     A string containing the URL to which the request is sent.
/// </param>
/// <param name="data" type="String">
///     A map or string that is sent to the server with the request.
/// </param>
/// <param name="callback" type="Function">
///     A callback function that is executed if the request succeeds.
/// </param>
/// <param name="type" type="String">
///     The type of data expected from the server. Default: Intelligent Guess (xml, json, script, or html).
/// </param>

		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: method,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
jQuery.getJSON = function( url, data, callback ) {
/// <summary>
///     Load JSON-encoded data from the server using a GET HTTP request.
/// </summary>
/// <param name="url" type="String">
///     A string containing the URL to which the request is sent.
/// </param>
/// <param name="data" type="Object">
///     A map or string that is sent to the server with the request.
/// </param>
/// <param name="callback" type="Function">
///     A callback function that is executed if the request succeeds.
/// </param>

		return jQuery.get( url, data, callback, "json" );
	};
jQuery.getScript = function( url, callback ) {
/// <summary>
///     Load a JavaScript file from the server using a GET HTTP request, then execute it.
/// </summary>
/// <param name="url" type="String">
///     A string containing the URL to which the request is sent.
/// </param>
/// <param name="callback" type="Function">
///     A callback function that is executed if the request succeeds.
/// </param>

		return jQuery.get( url, undefined, callback, "script" );
	};
jQuery.globalEval = function( data ) {
/// <summary>
///     Execute some JavaScript code globally.
/// </summary>
/// <param name="data" type="String">
///     The JavaScript code to execute.
/// </param>

		if ( data && rnotwhite.test( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	};
jQuery.grep = function( elems, callback, inv ) {
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

		var ret = [], retVal;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	};
jQuery.guid = 1;
jQuery.hasData = function( elem ) {
/// <summary>
///     Determine whether an element has any jQuery data associated with it.
/// </summary>
/// <param name="elem" domElement="true">
///     A DOM element to be checked for data.
/// </param>
/// <returns type="Boolean" />

		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];

		return !!elem && !isEmptyDataObject( elem );
	};
jQuery.holdReady = function( hold ) {
/// <summary>
///     Holds or releases the execution of jQuery's ready event.
/// </summary>
/// <param name="hold" type="Boolean">
///     Indicates whether the ready hold is being requested or released
/// </param>
/// <returns type="undefined" />

		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	};
jQuery.inArray = function( elem, array ) {
/// <summary>
///     Search for a specified value within an array and return its index (or -1 if not found).
/// </summary>
/// <param name="elem" type="Object">
///     The value to search for.
/// </param>
/// <param name="array" type="Array">
///     An array through which to search.
/// </param>
/// <returns type="Number" />

		if ( !array ) {
			return -1;
		}

		if ( indexOf ) {
			return indexOf.call( array, elem );
		}

		for ( var i = 0, length = array.length; i < length; i++ ) {
			if ( array[ i ] === elem ) {
				return i;
			}
		}

		return -1;
	};
jQuery.isEmptyObject = function( obj ) {
/// <summary>
///     Check to see if an object is empty (contains no properties).
/// </summary>
/// <param name="obj" type="Object">
///     The object that will be checked to see if it's empty.
/// </param>
/// <returns type="Boolean" />

		for ( var name in obj ) {
			return false;
		}
		return true;
	};
jQuery.isFunction = function( obj ) {
/// <summary>
///     Determine if the argument passed is a Javascript function object.
/// </summary>
/// <param name="obj" type="Object">
///     Object to test whether or not it is a function.
/// </param>
/// <returns type="boolean" />

		return jQuery.type(obj) === "function";
	};
jQuery.isNaN = function( obj ) {

		return obj == null || !rdigit.test( obj ) || isNaN( obj );
	};
jQuery.isPlainObject = function( obj ) {
/// <summary>
///     Check to see if an object is a plain object (created using "{}" or "new Object").
/// </summary>
/// <param name="obj" type="Object">
///     The object that will be checked to see if it's a plain object.
/// </param>
/// <returns type="Boolean" />

		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call(obj, "constructor") &&
				!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	};
jQuery.isReady = true;
jQuery.isWindow = function( obj ) {
/// <summary>
///     Determine whether the argument is a window.
/// </summary>
/// <param name="obj" type="Object">
///     Object to test whether or not it is a window.
/// </param>
/// <returns type="boolean" />

		return obj && typeof obj === "object" && "setInterval" in obj;
	};
jQuery.isXMLDoc = function( elem ) {
/// <summary>
///     Check to see if a DOM node is within an XML document (or is an XML document).
/// </summary>
/// <param name="elem" domElement="true">
///     The DOM node that will be checked to see if it's in an XML document.
/// </param>
/// <returns type="Boolean" />

	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

	return documentElement ? documentElement.nodeName !== "HTML" : false;
};
jQuery.lastModified = {};
jQuery.makeArray = function( array, results ) {
/// <summary>
///     Convert an array-like object into a true JavaScript array.
/// </summary>
/// <param name="array" type="Object">
///     Any object to turn into a native Array.
/// </param>
/// <returns type="Array" />

		var ret = results || [];

		if ( array != null ) {
			// The window, strings (and functions) also have 'length'
			// The extra typeof function check is to prevent crashes
			// in Safari 2 (See: #3039)
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			var type = jQuery.type( array );

			if ( array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( array ) ) {
				push.call( ret, array );
			} else {
				jQuery.merge( ret, array );
			}
		}

		return ret;
	};
jQuery.map = function( elems, callback, arg ) {
/// <summary>
///     Translate all items in an array or object to new array of items.
///     <para>1 - jQuery.map(array, callback(elementOfArray, indexInArray)) </para>
///     <para>2 - jQuery.map(arrayOrObject, callback( value, indexOrKey ))</para>
/// </summary>
/// <param name="elems" type="Array">
///     The Array to translate.
/// </param>
/// <param name="callback" type="Function">
///     The function to process each item against.  The first argument to the function is the array item, the second argument is the index in array The function can return any value. Within the function, this refers to the global (window) object.
/// </param>
/// <returns type="Array" />

		var value, key, ret = [],
			i = 0,
			length = elems.length,
			// jquery objects are treated as arrays
			isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( key in elems ) {
				value = callback( elems[ key ], key, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return ret.concat.apply( [], ret );
	};
jQuery.merge = function( first, second ) {
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

		var i = first.length,
			j = 0;

		if ( typeof second.length === "number" ) {
			for ( var l = second.length; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	};
jQuery.noConflict = function( deep ) {
/// <summary>
///     Relinquish jQuery's control of the $ variable.
/// </summary>
/// <param name="deep" type="Boolean">
///     A Boolean indicating whether to remove all jQuery variables from the global scope (including jQuery itself).
/// </param>
/// <returns type="Object" />

		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	};
jQuery.noData = { "embed": true,
"object": 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000',
"applet": true };
jQuery.nodeName = function( elem, name ) {

		return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
	};
jQuery.noop = function() {
/// <summary>
///     An empty function.
/// </summary>
/// <returns type="Function" />
};
jQuery.now = function() {
/// <summary>
///     Return a number representing the current time.
/// </summary>
/// <returns type="Number" />

		return (new Date()).getTime();
	};
jQuery.nth = function( cur, result, dir, elem ) {

		result = result || 1;
		var num = 0;

		for ( ; cur; cur = cur[dir] ) {
			if ( cur.nodeType === 1 && ++num === result ) {
				break;
			}
		}

		return cur;
	};
jQuery.offset = {};
jQuery.param = function( a, traditional ) {
/// <summary>
///     Create a serialized representation of an array or object, suitable for use in a URL query string or Ajax request.
///     <para>1 - jQuery.param(obj) </para>
///     <para>2 - jQuery.param(obj, traditional)</para>
/// </summary>
/// <param name="a" type="Object">
///     An array or object to serialize.
/// </param>
/// <param name="traditional" type="Boolean">
///     A Boolean indicating whether to perform a traditional "shallow" serialization.
/// </param>
/// <returns type="String" />

		var s = [],
			add = function( key, value ) {
				// If value is a function, invoke it and return its value
				value = jQuery.isFunction( value ) ? value() : value;
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};

		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jQuery.ajaxSettings.traditional;
		}

		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			});

		} else {
			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( var prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	};
jQuery.parseJSON = function( data ) {
/// <summary>
///     Takes a well-formed JSON string and returns the resulting JavaScript object.
/// </summary>
/// <param name="data" type="String">
///     The JSON string to parse.
/// </param>
/// <returns type="Object" />

		if ( typeof data !== "string" || !data ) {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = jQuery.trim( data );

		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test( data.replace( rvalidescape, "@" )
			.replace( rvalidtokens, "]" )
			.replace( rvalidbraces, "")) ) {

			return (new Function( "return " + data ))();

		}
		jQuery.error( "Invalid JSON: " + data );
	};
jQuery.parseXML = function( data ) {
/// <summary>
///     Parses a string into an XML document.
/// </summary>
/// <param name="data" type="String">
///     a well-formed XML string to be parsed
/// </param>
/// <returns type="XMLDocument" />

		var xml, tmp;
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	};
jQuery.post = function( url, data, callback, type ) {
/// <summary>
///     Load data from the server using a HTTP POST request.
/// </summary>
/// <param name="url" type="String">
///     A string containing the URL to which the request is sent.
/// </param>
/// <param name="data" type="String">
///     A map or string that is sent to the server with the request.
/// </param>
/// <param name="callback" type="Function">
///     A callback function that is executed if the request succeeds.
/// </param>
/// <param name="type" type="String">
///     The type of data expected from the server. Default: Intelligent Guess (xml, json, script, or html).
/// </param>

		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: method,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
jQuery.prop = function( elem, name, value ) {

		var nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return undefined;
		}

		var ret, hooks,
			notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return (elem[ name ] = value);
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	};
jQuery.propFix = { "tabindex": 'tabIndex',
"readonly": 'readOnly',
"for": 'htmlFor',
"class": 'className',
"maxlength": 'maxLength',
"cellspacing": 'cellSpacing',
"cellpadding": 'cellPadding',
"rowspan": 'rowSpan',
"colspan": 'colSpan',
"usemap": 'useMap',
"frameborder": 'frameBorder',
"contenteditable": 'contentEditable' };
jQuery.propHooks = { "tabIndex": {},
"selected": {} };
jQuery.proxy = function( fn, context ) {
/// <summary>
///     Takes a function and returns a new one that will always have a particular context.
///     <para>1 - jQuery.proxy(function, context) </para>
///     <para>2 - jQuery.proxy(context, name)</para>
/// </summary>
/// <param name="fn" type="Function">
///     The function whose context will be changed.
/// </param>
/// <param name="context" type="Object">
///     The object to which the context (this) of the function should be set.
/// </param>
/// <returns type="Function" />

		if ( typeof context === "string" ) {
			var tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		var args = slice.call( arguments, 2 ),
			proxy = function() {
				return fn.apply( context, args.concat( slice.call( arguments ) ) );
			};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;

		return proxy;
	};
jQuery.queue = function( elem, type, data ) {
/// <summary>
///     1: Show the queue of functions to be executed on the matched element.
///     <para>    1.1 - jQuery.queue(element, queueName)</para>
///     <para>2: Manipulate the queue of functions to be executed on the matched element.</para>
///     <para>    2.1 - jQuery.queue(element, queueName, newQueue) </para>
///     <para>    2.2 - jQuery.queue(element, queueName, callback())</para>
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

		if ( elem ) {
			type = (type || "fx") + "queue";
			var q = jQuery.data( elem, type, undefined, true );
			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !q || jQuery.isArray(data) ) {
					q = jQuery.data( elem, type, jQuery.makeArray(data), true );
				} else {
					q.push( data );
				}
			}
			return q || [];
		}
	};
jQuery.ready = function( wait ) {

		// Either a released hold or an DOMready/load event and not yet ready
		if ( (wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady) ) {
			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
			if ( !document.body ) {
				return setTimeout( jQuery.ready, 1 );
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.resolveWith( document, [ jQuery ] );

			// Trigger any bound ready events
			if ( jQuery.fn.trigger ) {
				jQuery( document ).trigger( "ready" ).unbind( "ready" );
			}
		}
	};
jQuery.readyWait = 0;
jQuery.removeAttr = function( elem, name ) {

		var propName;
		if ( elem.nodeType === 1 ) {
			name = jQuery.attrFix[ name ] || name;

			jQuery.attr( elem, name, "" );
			elem.removeAttribute( name );

			// Set corresponding property to false for boolean attributes
			if ( rboolean.test( name ) && (propName = jQuery.propFix[ name ] || name) in elem ) {
				elem[ propName ] = false;
			}
		}
	};
jQuery.removeData = function( elem, name, pvt /* Internal Use Only */ ) {
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

		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache,

			// Reference to internal data cache key
			internalKey = jQuery.expando,

			isNode = elem.nodeType,

			// See jQuery.data for more information
			cache = isNode ? jQuery.cache : elem,

			// See jQuery.data for more information
			id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
		if ( !cache[ id ] ) {
			return;
		}

		if ( name ) {

			thisCache = pvt ? cache[ id ][ internalKey ] : cache[ id ];

			if ( thisCache ) {

				// Support interoperable removal of hyphenated or camelcased keys
				if ( !thisCache[ name ] ) {
					name = jQuery.camelCase( name );
				}

				delete thisCache[ name ];

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if ( !isEmptyDataObject(thisCache) ) {
					return;
				}
			}
		}

		// See jQuery.data for more information
		if ( pvt ) {
			delete cache[ id ][ internalKey ];

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject(cache[ id ]) ) {
				return;
			}
		}

		var internalCache = cache[ id ][ internalKey ];

		// Browsers that fail expando deletion also refuse to delete expandos on
		// the window, but it will allow it on all other JS objects; other browsers
		// don't care
		// Ensure that `cache` is not a window object #10080
		if ( jQuery.support.deleteExpando || !cache.setInterval ) {
			delete cache[ id ];
		} else {
			cache[ id ] = null;
		}

		// We destroyed the entire user cache at once because it's faster than
		// iterating through each key, but we need to continue to persist internal
		// data if it existed
		if ( internalCache ) {
			cache[ id ] = {};
			// TODO: This is a hack for 1.5 ONLY. Avoids exposing jQuery
			// metadata on plain JS objects when the object is serialized using
			// JSON.stringify
			if ( !isNode ) {
				cache[ id ].toJSON = jQuery.noop;
			}

			cache[ id ][ internalKey ] = internalCache;

		// Otherwise, we need to eliminate the expando on the node to avoid
		// false lookups in the cache for entries that no longer exist
		} else if ( isNode ) {
			// IE does not allow us to delete expando properties from nodes,
			// nor does it have a removeAttribute function on Document nodes;
			// we must handle all of these cases
			if ( jQuery.support.deleteExpando ) {
				delete elem[ jQuery.expando ];
			} else if ( elem.removeAttribute ) {
				elem.removeAttribute( jQuery.expando );
			} else {
				elem[ jQuery.expando ] = null;
			}
		}
	};
jQuery.removeEvent = function( elem, type, handle ) {

		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	};
jQuery.sibling = function( n, elem ) {

		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	};
jQuery.speed = function( speed, easing, fn ) {

		var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
			opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;

		// Queueing
		opt.old = opt.complete;
		opt.complete = function( noUnmark ) {
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}

			if ( opt.queue !== false ) {
				jQuery.dequeue( this );
			} else if ( noUnmark !== false ) {
				jQuery._unmark( this );
			}
		};

		return opt;
	};
jQuery.style = function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, origName = jQuery.camelCase( name ),
			style = elem.style, hooks = jQuery.cssHooks[ origName ];

		name = jQuery.cssProps[ origName ] || origName;

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( +( ret[1] + 1) * +ret[2] ) + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value )) !== undefined ) {
				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	};
jQuery.sub = function() {
/// <summary>
///     Creates a new copy of jQuery whose properties and methods can be modified without affecting the original jQuery object.
/// </summary>
/// <returns type="jQuery" />

		function jQuerySub( selector, context ) {
			return new jQuerySub.fn.init( selector, context );
		}
		jQuery.extend( true, jQuerySub, this );
		jQuerySub.superclass = this;
		jQuerySub.fn = jQuerySub.prototype = this();
		jQuerySub.fn.constructor = jQuerySub;
		jQuerySub.sub = this.sub;
		jQuerySub.fn.init = function init( selector, context ) {
			if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
				context = jQuerySub( context );
			}

			return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
		};
		jQuerySub.fn.init.prototype = jQuerySub.fn;
		var rootjQuerySub = jQuerySub(document);
		return jQuerySub;
	};
jQuery.support = { "leadingWhitespace": true,
"tbody": true,
"htmlSerialize": true,
"style": true,
"hrefNormalized": true,
"opacity": true,
"cssFloat": true,
"checkOn": true,
"optSelected": false,
"getSetAttribute": true,
"submitBubbles": true,
"changeBubbles": true,
"focusinBubbles": true,
"deleteExpando": true,
"noCloneEvent": true,
"inlineBlockNeedsLayout": false,
"shrinkWrapBlocks": false,
"reliableMarginRight": true,
"noCloneChecked": false,
"optDisabled": true,
"radioValue": false,
"checkClone": false,
"appendChecked": true,
"boxModel": true,
"reliableHiddenOffsets": true,
"ajax": true,
"cors": false };
jQuery.swap = function( elem, options, callback ) {

		var old = {};

		// Remember the old values, and insert the new ones
		for ( var name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		callback.call( elem );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}
	};
jQuery.text = function( elems ) {

	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += Sizzle.getText( elem.childNodes );
		}
	}

	return ret;
};
jQuery.trim = function( text ) {
/// <summary>
///     Remove the whitespace from the beginning and end of a string.
/// </summary>
/// <param name="text" type="String">
///     The string to trim.
/// </param>
/// <returns type="String" />

			return text == null ?
				"" :
				trim.call( text );
		};
jQuery.type = function( obj ) {
/// <summary>
///     Determine the internal JavaScript [[Class]] of an object.
/// </summary>
/// <param name="obj" type="Object">
///     Object to get the internal JavaScript [[Class]] of.
/// </param>
/// <returns type="String" />

		return obj == null ?
			String( obj ) :
			class2type[ toString.call(obj) ] || "object";
	};
jQuery.uaMatch = function( ua ) {

		ua = ua.toLowerCase();

		var match = rwebkit.exec( ua ) ||
			ropera.exec( ua ) ||
			rmsie.exec( ua ) ||
			ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
			[];

		return { browser: match[1] || "", version: match[2] || "0" };
	};
jQuery.unique = function( results ) {
/// <summary>
///     Sorts an array of DOM elements, in place, with the duplicates removed. Note that this only works on arrays of DOM elements, not strings or numbers.
/// </summary>
/// <param name="results" type="Array">
///     The Array of DOM elements.
/// </param>
/// <returns type="Array" />

	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};
jQuery.uuid = 0;
jQuery.valHooks = { "option": {},
"select": {},
"radio": {},
"checkbox": {} };
jQuery.when = function( firstParam ) {
/// <summary>
///     Provides a way to execute callback functions based on one or more objects, usually Deferred objects that represent asynchronous events.
/// </summary>
/// <param name="firstParam" type="Deferred">
///     One or more Deferred objects, or plain JavaScript objects.
/// </param>
/// <returns type="Promise" />

		var args = arguments,
			i = 0,
			length = args.length,
			count = length,
			deferred = length <= 1 && firstParam && jQuery.isFunction( firstParam.promise ) ?
				firstParam :
				jQuery.Deferred();
		function resolveFunc( i ) {
			return function( value ) {
				args[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
				if ( !( --count ) ) {
					// Strange bug in FF4:
					// Values changed onto the arguments object sometimes end up as undefined values
					// outside the $.when method. Cloning the object into a fresh array solves the issue
					deferred.resolveWith( deferred, sliceDeferred.call( args, 0 ) );
				}
			};
		}
		if ( length > 1 ) {
			for( ; i < length; i++ ) {
				if ( args[ i ] && jQuery.isFunction( args[ i ].promise ) ) {
					args[ i ].promise().then( resolveFunc(i), deferred.reject );
				} else {
					--count;
				}
			}
			if ( !count ) {
				deferred.resolveWith( deferred, args );
			}
		} else if ( deferred !== firstParam ) {
			deferred.resolveWith( deferred, length ? [ firstParam ] : [] );
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
jQuery.Event.prototype.preventDefault = function() {
/// <summary>
///     If this method is called, the default action of the event will not be triggered.
/// </summary>
/// <returns type="undefined" />

		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}

		// if preventDefault exists run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// otherwise set the returnValue property of the original event to false (IE)
		} else {
			e.returnValue = false;
		}
	};
jQuery.Event.prototype.stopImmediatePropagation = function() {
/// <summary>
///     Keeps the rest of the handlers from being executed and prevents the event from bubbling up the DOM tree.
/// </summary>

		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	};
jQuery.Event.prototype.stopPropagation = function() {
/// <summary>
///     Prevents the event from bubbling up the DOM tree, preventing any parent handlers from being notified of the event.
/// </summary>

		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	};
jQuery.prototype._toggle = function( fn ) {

		// Save reference to arguments for access in closure
		var args = arguments,
			guid = fn.guid || jQuery.guid++,
			i = 0,
			toggler = function( event ) {
				// Figure out which function to execute
				var lastToggle = ( jQuery.data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery.data( this, "lastToggle" + fn.guid, lastToggle + 1 );

				// Make sure that clicks stop
				event.preventDefault();

				// and execute the function
				return args[ lastToggle ].apply( this, arguments ) || false;
			};

		// link all the functions, so any of them can unbind this click handler
		toggler.guid = guid;
		while ( i < args.length ) {
			args[ i++ ].guid = guid;
		}

		return this.click( toggler );
	};
jQuery.prototype.add = function( selector, context ) {
/// <summary>
///     Add elements to the set of matched elements.
///     <para>1 - add(selector) </para>
///     <para>2 - add(elements) </para>
///     <para>3 - add(html) </para>
///     <para>4 - add(jQuery object) </para>
///     <para>5 - add(selector, context)</para>
/// </summary>
/// <param name="selector" type="String">
///     A string representing a selector expression to find additional elements to add to the set of matched elements.
/// </param>
/// <param name="context" domElement="true">
///     The point in the document at which the selector should begin matching; similar to the context argument of the $(selector, context) method.
/// </param>
/// <returns type="jQuery" />

		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jQuery.unique( all ) );
	};
jQuery.prototype.addClass = function( value ) {
/// <summary>
///     Adds the specified class(es) to each of the set of matched elements.
///     <para>1 - addClass(className) </para>
///     <para>2 - addClass(function(index, currentClass))</para>
/// </summary>
/// <param name="value" type="String">
///     One or more class names to be added to the class attribute of each matched element.
/// </param>
/// <returns type="jQuery" />

		var classNames, i, l, elem,
			setClass, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call(this, j, this.className) );
			});
		}

		if ( value && typeof value === "string" ) {
			classNames = value.split( rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 ) {
					if ( !elem.className && classNames.length === 1 ) {
						elem.className = value;

					} else {
						setClass = " " + elem.className + " ";

						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) ) {
								setClass += classNames[ c ] + " ";
							}
						}
						elem.className = jQuery.trim( setClass );
					}
				}
			}
		}

		return this;
	};
jQuery.prototype.after = function() {
/// <summary>
///     Insert content, specified by the parameter, after each element in the set of matched elements.
///     <para>1 - after(content, content) </para>
///     <para>2 - after(function(index))</para>
/// </summary>
/// <param name="" type="jQuery">
///     HTML string, DOM element, or jQuery object to insert after each element in the set of matched elements.
/// </param>
/// <param name="" type="jQuery">
///     One or more additional DOM elements, arrays of elements, HTML strings, or jQuery objects to insert after each element in the set of matched elements.
/// </param>
/// <returns type="jQuery" />

		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			});
		} else if ( arguments.length ) {
			var set = this.pushStack( this, "after", arguments );
			set.push.apply( set, jQuery(arguments[0]).toArray() );
			return set;
		}
	};
jQuery.prototype.ajaxComplete = function( f ){
/// <summary>
///     Register a handler to be called when Ajax requests complete. This is an Ajax Event.
/// </summary>
/// <param name="f" type="Function">
///     The function to be invoked.
/// </param>
/// <returns type="jQuery" />

		return this.bind( o, f );
	};
jQuery.prototype.ajaxError = function( f ){
/// <summary>
///     Register a handler to be called when Ajax requests complete with an error. This is an Ajax Event.
/// </summary>
/// <param name="f" type="Function">
///     The function to be invoked.
/// </param>
/// <returns type="jQuery" />

		return this.bind( o, f );
	};
jQuery.prototype.ajaxSend = function( f ){
/// <summary>
///     Attach a function to be executed before an Ajax request is sent. This is an Ajax Event.
/// </summary>
/// <param name="f" type="Function">
///     The function to be invoked.
/// </param>
/// <returns type="jQuery" />

		return this.bind( o, f );
	};
jQuery.prototype.ajaxStart = function( f ){
/// <summary>
///     Register a handler to be called when the first Ajax request begins. This is an Ajax Event.
/// </summary>
/// <param name="f" type="Function">
///     The function to be invoked.
/// </param>
/// <returns type="jQuery" />

		return this.bind( o, f );
	};
jQuery.prototype.ajaxStop = function( f ){
/// <summary>
///     Register a handler to be called when all Ajax requests have completed. This is an Ajax Event.
/// </summary>
/// <param name="f" type="Function">
///     The function to be invoked.
/// </param>
/// <returns type="jQuery" />

		return this.bind( o, f );
	};
jQuery.prototype.ajaxSuccess = function( f ){
/// <summary>
///     Attach a function to be executed whenever an Ajax request completes successfully. This is an Ajax Event.
/// </summary>
/// <param name="f" type="Function">
///     The function to be invoked.
/// </param>
/// <returns type="jQuery" />

		return this.bind( o, f );
	};
jQuery.prototype.andSelf = function() {
/// <summary>
///     Add the previous set of elements on the stack to the current set.
/// </summary>
/// <returns type="jQuery" />

		return this.add( this.prevObject );
	};
jQuery.prototype.animate = function( prop, speed, easing, callback ) {
/// <summary>
///     Perform a custom animation of a set of CSS properties.
///     <para>1 - animate(properties, duration, easing, complete) </para>
///     <para>2 - animate(properties, options)</para>
/// </summary>
/// <param name="prop" type="Object">
///     A map of CSS properties that the animation will move toward.
/// </param>
/// <param name="speed" type="Number">
///     A string or number determining how long the animation will run.
/// </param>
/// <param name="easing" type="String">
///     A string indicating which easing function to use for the transition.
/// </param>
/// <param name="callback" type="Function