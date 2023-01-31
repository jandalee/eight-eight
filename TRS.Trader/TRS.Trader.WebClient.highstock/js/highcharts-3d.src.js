// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS

/**
 * @license Highcharts JS v4.1.7 (2015-06-26)
 *
 * (c) 2009-2013 Torstein Hønsi
 *
 * License: www.highcharts.com/license
 */

// JSLint options:
/*global Highcharts, HighchartsAdapter, document, window, navigator, setInterval, clearInterval, clearTimeout, setTimeout, location, jQuery, $, console */

(function (Highcharts) {
	/**
	Shorthands for often used function
*/ 
/**
 *	Mathematical Functionility
 */
var PI = Math.PI,
	deg2rad = (PI / 180), // degrees to radians 
	sin = Math.sin,
	cos = Math.cos, 
	pick = Highcharts.pick,
	round = Math.round;

/**
 * Transforms a given array of points according to the angles in chart.options.
 * Parameters: 
 *		- points: the array of points
 *		- chart: the chart
 *		- insidePlotArea: wether to verifiy the points are inside the plotArea
 * Returns:
 *		- an array of transformed points
 */
function perspective(points, chart, insidePlotArea) {
	var options3d = chart.options.chart.options3d,
		inverted = false,
		origin;

	if (insidePlotArea) {
		inverted = chart.inverted;
		origin = {
			x: chart.plotWidth / 2,
			y: chart.plotHeight / 2,
			z: options3d.depth / 2,
			vd: pick(options3d.depth, 1) * pick(options3d.viewDistance, 0)
		};
	} else {
		origin = {
			x: chart.plotLeft + (chart.plotWidth / 2),
			y: chart.plotTop + (chart.plotHeight / 2),
			z: options3d.depth / 2,
			vd: pick(options3d.depth, 1) * pick(options3d.viewDistance, 0)
		};
	}

	var result = [],
		xe = origin.x,
		ye = origin.y,
		ze = origin.z,
		vd = origin.vd,
		angle1 = deg2rad * (inverted ?  options3d.beta  : -options3d.beta),
		angle2 = deg2rad * (inverted ? -options3d.alpha :  options3d.alpha),
		s1 = sin(angle1),
		c1 = cos(angle1),
		s2 = sin(angle2),
		c2 = cos(angle2);

	var x, y, z, px, py, pz;

	// Transform each point
	Highcharts.each(points, function (point) {
		x = (inverted ? point.y : point.x) - xe;
		y = (inverted ? point.x : point.y) - ye;
		z = (point.z || 0) - ze;

		//Apply 3-D rotation
		px = c1 * x - s1 * z;
		py = -s1 * s2 * x - c1 * s2 * z + c2 * y;
		pz = s1 * c2 * x + c1 * c2 * z + s2 * y;

		//Apply perspective
		if ((vd > 0) && (vd < Number.POSITIVE_INFINITY)) {
			px = px * (vd / (pz + ze + vd));
			py = py * (vd / (pz + ze + vd));
		}

		//Apply translation
		px = px + xe;
		py = py + ye;
		pz = pz + ze;

		result.push({
			x: (inverted ? py : px),
			y: (inverted ? px : py),
			z: pz
		});
	});
	return result;
}
// Make function acessible to plugins
Highcharts.perspective = perspective;
/*** 
	EXTENSION TO THE SVG-RENDERER TO ENABLE 3D SHAPES
	***/
////// HELPER METHODS //////
var dFactor = (4 * (Math.sqrt(2) - 1) / 3) / (PI / 2);

function defined(obj) {
	return obj !== undefined && obj !== null;
}

//Shoelace algorithm -- http://en.wikipedia.org/wiki/Shoelace_formula
function shapeArea(vertexes) {
	var area = 0,
		i,
		j;
	for (i = 0; i < vertexes.length; i++) {
		j = (i + 1) % vertexes.length;
		area += vertexes[i].x * vertexes[j].y - vertexes[j].x * vertexes[i].y;
	}
	return area / 2;
}

function averageZ(vertexes) {
	var z = 0,
		i;
	for (i = 0; i < vertexes.length; i++) {
		z += vertexes[i].z;
	}
	return vertexes.length ? z / vertexes.length : 0;
}

/** Method to construct a curved path
  * Can 'wrap' around more then 180 degrees
  */
function curveTo(cx, cy, rx, ry, start, end, dx, dy) {
	var result = [];
	if ((end > start) && (end - start > PI / 2 + 0.0001)) {
		result = result.concat(curveTo(cx, cy, rx, ry, start, start + (PI / 2), dx, dy));
		result = result.concat(curveTo(cx, cy, rx, ry, start + (PI / 2), end, dx, dy));
		return result;
	} else if ((end < start) && (start - end > PI / 2 + 0.0001)) {			
		result = result.concat(curveTo(cx, cy, rx, ry, start, start - (PI / 2), dx, dy));
		result = result.concat(curveTo(cx, cy, rx, ry, start - (PI / 2), end, dx, dy));
		return result;
	} else {
		var arcAngle = end - start;
		return [
			'C', 
			cx + (rx * cos(start)) - ((rx * dFactor * arcAngle) * sin(start)) + dx,
			cy + (ry * sin(start)) + ((ry * dFactor * arcAngle) * cos(start)) + dy,
			cx + (rx * cos(end)) + ((rx * dFactor * arcAngle) * sin(end)) + dx,
			cy + (ry * sin(end)) - ((ry * dFactor * arcAngle) * cos(end)) + dy,

			cx + (rx * cos(end)) + dx,
			cy + (ry * sin(end)) + dy
		];
	}
}

Highcharts.SVGRenderer.prototype.toLinePath = function (points, closed) {
	var result = [];

	// Put "L x y" for each point
	Highcharts.each(points, function (point) {
		result.push('L', point.x, point.y);
	});

	if (points.length) {
		// Set the first element to M
		result[0] = 'M';

		// If it is a closed line, add Z
		if (closed) {
			result.push('Z');
		}
	}
	
	return result;
};

////// CUBOIDS //////
Highcharts.SVGRenderer.prototype.cuboid = function (shapeArgs) {

	var result = this.g(),
	paths = this.cuboidPath(shapeArgs);

	// create the 3 sides
	result.front = this.path(paths[0]).attr({zIndex: paths[3], 'stroke-linejoin': 'round'}).add(result);
	result.top = this.path(paths[1]).attr({zIndex: paths[4], 'stroke-linejoin': 'round'}).add(result);
	result.side = this.path(paths[2]).attr({zIndex: paths[5], 'stroke-linejoin': 'round'}).add(result);

	// apply the fill everywhere, the top a bit brighter, the side a bit darker
	result.fillSetter = function (color) {
		var c0 = color,
		c1 = Highcharts.Color(color).brighten(0.1).get(),
		c2 = Highcharts.Color(color).brighten(-0.1).get();

		this.front.attr({fill: c0});
		this.top.attr({fill: c1});
		this.side.attr({fill: c2});

		this.color = color;
		return this;
	};

	// apply opacaity everywhere
	result.opacitySetter = function (opacity) {
		this.front.attr({opacity: opacity});
		this.top.attr({opacity: opacity});
		this.side.attr({opacity: opacity});
		return this;
	};

	result.attr = function (args) {
		if (args.shapeArgs || defined(args.x)) {
			var shapeArgs = args.shapeArgs || args;
			var paths = this.renderer.cuboidPath(shapeArgs);
			this.front.attr({d: paths[0], zIndex: paths[3]});
			this.top.attr({d: paths[1], zIndex: paths[4]});
			this.side.attr({d: paths[2], zIndex: paths[5]});			
		} else {
			Highcharts.SVGElement.prototype.attr.call(this, args);
		}

		return this;
	};
	
	result.animate = function (args, duration, complete) {
		if (defined(args.x) && defined(args.y)) {
			var paths = this.renderer.cuboidPath(args);
			this.front.attr({zIndex: paths[3]}).animate({d: paths[0]}, duration, complete);
			this.top.attr({zIndex: paths[4]}).animate({d: paths[1]}, duration, complete);
			this.side.attr({zIndex: paths[5]}).animate({d: paths[2]}, duration, complete);
		} else if (args.opacity) {				
				this.front.animate(args, duration, complete);
				this.top.animate(args, duration, complete);
				this.side.animate(args, duration, complete);
		} else {
			Highcharts.SVGElement.prototype.animate.call(this, args, duration, complete);
		}
		return this;
	};

	// destroy all children
	result.destroy = function () {
		this.front.destroy();
		this.top.destroy();
		this.side.destroy();

		return null;
	};

	// Apply the Z index to the cuboid group
	result.attr({ zIndex: -paths[3] });

	return result;
};

/**
 *	Generates a cuboid
 */
Highcharts.SVGRenderer.prototype.cuboidPath = function (shapeArgs) {
	var x = shapeArgs.x,
		y = shapeArgs.y,
		z = shapeArgs.z,
		h = shapeArgs.height,
		w = shapeArgs.width,
		d = shapeArgs.depth,		
		chart = Highcharts.charts[this.chartIndex],
		map = Highcharts.map;

	// The 8 corners of the cube
	var pArr = [
		{x: x, y: y, z: z},
		{x: x + w, y: y, z: z},
		{x: x + w, y: y + h, z: z},
		{x: x, y: y + h, z: z},
		{x: x, y: y + h, z: z + d},
		{x: x + w, y: y + h, z: z + d},
		{x: x + w, y: y, z: z + d},
		{x: x, y: y, z: z + d}
	];

	// apply perspective
	pArr = perspective(pArr, chart, shapeArgs.insidePlotArea);

	// helper method to decide which side is visible
	var pickShape = function (path1, path2) {
		path1 = map(path1, function (i) { return pArr[i]; });
		path2 = map(path2, function (i) { return pArr[i]; });
		if (shapeArea(path1) < 0) {
			return path1;
		} else if (shapeArea(path2) < 0) {
			return path2;
		} else {
			return [];
		}
	};

	// front or back
	var front = [3, 2, 1, 0];
	var back = [7, 6, 5, 4];
	var path1 = pickShape(front, back);

	// top or bottom
	var top = [1, 6, 7, 0];
	var bottom = [4, 5, 2, 3];
	var path2 = pickShape(top, bottom);

	// side
	var right = [1, 2, 5, 6];
	var left = [0, 7, 4, 3];
	var path3 = pickShape(right, left);

	return [this.toLinePath(path1, true), this.toLinePath(path2, true), this.toLinePath(path3, true), averageZ(path1), averageZ(path2), averageZ(path3)];
};

////// SECTORS //////
Highcharts.SVGRenderer.prototype.arc3d = function (shapeArgs) {

	shapeArgs.alpha *= deg2rad;
	shapeArgs.beta *= deg2rad;
	var result = this.g(),
		paths = this.arc3dPath(shapeArgs),
		renderer = result.renderer;

	var zIndex = paths.zTop * 100;

	result.shapeArgs = shapeArgs;	// Store for later use

	// create the different sub sections of the shape
	result.top = renderer.path(paths.top).setRadialReference(shapeArgs.center).attr({zIndex: paths.zTop}).add(result);
	result.side1 = renderer.path(paths.side2).attr({zIndex: paths.zSide1});
	result.side2 = renderer.path(paths.side1).attr({zIndex: paths.zSide2});
	result.inn = renderer.path(paths.inn).attr({zIndex: paths.zInn});
	result.out = renderer.path(paths.out).attr({zIndex: paths.zOut});

	// apply the fill to the top and a darker shade to the sides
	result.fillSetter = function (color) {
		this.color = color;

		var c0 = color,
		c2 = Highcharts.Color(color).brighten(-0.1).get();
		
		this.side1.attr({fill: c2});
		this.side2.attr({fill: c2});
		this.inn.attr({fill: c2});
		this.out.attr({fill: c2});
		this.top.attr({fill: c0});
		return this;
	};
	
	// apply the translation to all
	result.translateXSetter = function (value) {
		this.out.attr({translateX: value});
		this.inn.attr({translateX: value});
		this.side1.attr({translateX: value});
		this.side2.attr({translateX: value});
		this.top.attr({translateX: value});
	};
	
	result.translateYSetter = function (value) {
		this.out.attr({translateY: value});
		this.inn.attr({translateY: value});
		this.side1.attr({translateY: value});
		this.side2.attr({translateY: value});
		this.top.attr({translateY: value});
	};

	result.animate = function (args, duration, complete) {
		if (defined(args.end) || defined(args.start)) {
			this._shapeArgs = this.shapeArgs;

			Highcharts.SVGElement.prototype.animate.call(this, {
				_args: args	
			}, {
				duration: duration,
				step: function () {
					var args = arguments,
						fx = args[1],
						result = fx.elem,						
						start = result._shapeArgs,
						end = fx.end,
						pos = fx.pos,
						sA = Highcharts.merge(start, {
							x: start.x + ((end.x - start.x) * pos),
							y: start.y + ((end.y - start.y) * pos),
							r: start.r + ((end.r - start.r) * pos),
							innerR: start.innerR + ((end.innerR - start.innerR) * pos),
							start: start.start + ((end.start - start.start) * pos),
							end: start.end + ((end.end - start.end) * pos)
						});

					var paths = result.renderer.arc3dPath(sA);

					result.shapeArgs = sA;

					result.top.attr({d: paths.top, zIndex: paths.zTop});
					result.inn.attr({d: paths.inn, zIndex: paths.zInn});
					result.out.attr({d: paths.out, zIndex: paths.zOut});
					result.side1.attr({d: paths.side1, zIndex: paths.zSide1});
					result.side2.attr({d: paths.side2, zIndex: paths.zSide2});

				}
			}, complete);
		} else {			
			Highcharts.SVGElement.prototype.animate.call(this, args, duration, complete);
		}
		return this;
	};

	// destroy all children
	result.destroy = function () {
		this.top.destroy();
		this.out.destroy();
		this.inn.destroy();
		this.side1.destroy();
		this.side2.destroy();

		Highcharts.SVGElement.prototype.destroy.call(this);
	};
	// hide all children
	result.hide = function () {
		this.top.hide();
		this.out.hide();
		this.inn.hide();
		this.side1.hide();
		this.side2.hide();
	};
	result.show = function () {
		this.top.show();
		this.out.show();
		this.inn.show();
		this.side1.show();
		this.side2.show();
	};	
	// show all children
	result.zIndex = zIndex;
	result.attr({zIndex: zIndex});
	return result;
};

/**
 * Generate the paths required to draw a 3D arc
 */
Highcharts.SVGRenderer.prototype.arc3dPath = function (shapeArgs) {
	var cx = shapeArgs.x, // x coordinate of the center
		cy = shapeArgs.y, // y coordinate of the center
		start = shapeArgs.start, // start angle
		end = shapeArgs.end - 0.00001, // end angle
		r = shapeArgs.r, // radius
		ir = shapeArgs.innerR, // inner radius
		d = shapeArgs.depth, // depth
		alpha = shapeArgs.alpha, // alpha rotation of the chart
		beta = shapeArgs.beta; // beta rotation of the chart

	// Derived Variables
	var cs = cos(start),		// cosinus of the start angle
		ss = sin(start),		// sinus of the start angle
		ce = cos(end),			// cosinus of the end angle
		se = sin(end),			// sinus of the end angle
		rx = r * cos(beta),		// x-radius 
		ry = r * cos(alpha),	// y-radius
		irx = ir * cos(beta),	// x-radius (inner)
		iry = ir * cos(alpha),	// y-radius (inner)
		dx = d * sin(beta),		// distance between top and bottom in x
		dy = d * sin(alpha);	// distance between top and bottom in y

	// TOP	
	var top = ['M', cx + (rx * cs), cy + (ry * ss)];
	top = top.concat(curveTo(cx, cy, rx, ry, start, end, 0, 0));
	top = top.concat([
		'L', cx + (irx * ce), cy + (iry * se)
	]);
	top = top.concat(curveTo(cx, cy, irx, iry, end, start, 0, 0));
	top = top.concat(['Z']);

	// OUTSIDE
	var b = (beta > 0 ? PI / 2 : 0),
		a = (alpha > 0 ? 0 : PI / 2);

	var start2 = start > -b ? start : (end > -b ? -b : start),
		end2 = end < PI - a ? end : (start < PI - a ? PI - a : end);
	
	var out = ['M', cx + (rx * cos(start2)), cy + (ry * sin(start2))];
	out = out.concat(curveTo(cx, cy, rx, ry, start2, end2, 0, 0));
	out = out.concat([
		'L', cx + (rx * cos(end2)) + dx, cy + (ry * sin(end2)) + dy
	]);
	out = out.concat(curveTo(cx, cy, rx, ry, end2, start2, dx, dy));
	out = out.concat(['Z']);

	// INSIDE
	var inn = ['M', cx + (irx * cs), cy + (iry * ss)];
	inn = inn.concat(curveTo(cx, cy, irx, iry, start, end, 0, 0));
	inn = inn.concat([
		'L', cx + (irx * cos(end)) + dx, cy + (iry * sin(end)) + dy
	]);
	inn = inn.concat(curveTo(cx, cy, irx, iry, end, start, dx, dy));
	inn = inn.concat(['Z']);

	// SIDES
	var side1 = [
		'M', cx + (rx * cs), cy + (ry * ss),
		'L', cx + (rx * cs) + dx, cy + (ry * ss) + dy,
		'L', cx + (irx * cs) + dx, cy + (iry * ss) + dy,
		'L', cx + (irx * cs), cy + (iry * ss),
		'Z'
	];
	var side2 = [
		'M', cx + (rx * ce), cy + (ry * se),
		'L', cx + (rx * ce) + dx, cy + (ry * se) + dy,
		'L', cx + (irx * ce) + dx, cy + (iry * se) + dy,
		'L', cx + (irx * ce), cy + (iry * se),
		'Z'
	];

	var a1 = sin((start + end) / 2),
		a2 = sin(start),
		a3 = sin(end);

	return {
		top: top,
		zTop: r,
		out: out,
		zOut: Math.max(a1, a2, a3) * r,
		inn: inn,
		zInn: Math.max(a1, a2, a3) * r,
		side1: side1,
		zSide1: a2 * (r * 0.99),
		side2: side2,
		zSide2: a3 * (r * 0.99)
	};
};
/*** 
	EXTENSION FOR 3D CHARTS
***/
// Shorthand to check the is3d flag
Highcharts.Chart.prototype.is3d = function () {
	return this.options.chart.options3d && this.options.chart.options3d.enabled; // #4280
};

Highcharts.wrap(Highcharts.Chart.prototype, 'isInsidePlot', function (proceed) {
	if (this.is3d()) {
		return true;
	} else {
		return proceed.apply(this, [].slice.call(arguments, 1));
	}
});

var defaultChartOptions = Highcharts.getOptions();
defaultChartOptions.chart.options3d = {
	enabled: false,
	alpha: 0,
	beta: 0,
	depth: 100,
	viewDistance: 25,
	frame: {
		bottom: { size: 1, color: 'rgba(255,255,255,0)' },
		side: { size: 1, color: 'rgba(255,255,255,0)' },
		back: { size: 1, color: 'rgba(255,255,255,0)' }
	}
};

Highcharts.wrap(Highcharts.Chart.prototype, 'init', function (proceed) {
	var args = [].slice.call(arguments, 1),
		plotOptions,
		pieOptions;

	if (args[0].chart.options3d && args[0].chart.options3d.enabled) {
		plotOptions = args[0].plotOptions || {};
		pieOptions = plotOptions.pie || {};

		pieOptions.borderColor = Highcharts.pick(pieOptions.borderColor, undefined); 
	}
	proceed.apply(this, args);
});

Highcharts.wrap(Highcharts.Chart.prototype, 'setChartSize', function (proceed) {
	proceed.apply(this, [].slice.call(arguments, 1));

	if (this.is3d()) {
		var inverted = this.inverted,
			clipBox = this.clipBox,
			margin = this.margin,
			x = inverted ? 'y' : 'x',
			y = inverted ? 'x' : 'y',
			w = inverted ? 'height' : 'width',
			h = inverted ? 'width' : 'height';

		clipBox[x] = -(margin[3] || 0);
		clipBox[y] = -(margin[0] || 0);
		clipBox[w] = this.chartWidth + (margin[3] || 0) + (margin[1] || 0);
		clipBox[h] = this.chartHeight + (margin[0] || 0) + (margin[2] || 0);
	}
});

Highcharts.wrap(Highcharts.Chart.prototype, 'redraw', function (proceed) {
	if (this.is3d()) {
		// Set to force a redraw of all elements
		this.isDirtyBox = true;
	}
	proceed.apply(this, [].slice.call(arguments, 1));	
});

// Draw the series in the reverse order (#3803, #3917)
Highcharts.wrap(Highcharts.Chart.prototype, 'renderSeries', function (proceed) {
	var series,
		i = this.series.length;
	
	if (this.is3d()) {
		while (i--) {		
			series = this.series[i];
			series.translate();
			series.render();	
		}
	} else {
		proceed.call(this);
	}
});

Highcharts.Chart.prototype.retrieveStacks = function (stacking) {
	var series = this.series,
		stacks = {},
		stackNumber,
		i = 1;

	Highcharts.each(this.series, function (S) {
		stackNumber = stacking ? (S.options.stack || 0) : series.length - 1 - S.index; // #3841
		if (!stacks[stackNumber]) {
			stacks[stackNumber] = { series: [S], position: i};
			i++;
		} else {
			stacks[stackNumber].series.push(S);
		}
	});

	stacks.totalStacks = i + 1;
	return stacks;
};

/***
	EXTENSION TO THE AXIS
***/
Highcharts.wrap(Highcharts.Axis.prototype, 'init', function (proceed) {
	var args = arguments;
	if (args[1].is3d()) {
		args[2].tickWidth = Highcharts.pick(args[2].tickWidth, 0);
		args[2].gridLineWidth = Highcharts.pick(args[2].gridLineWidth, 1);
	}

	proceed.apply(this, [].slice.call(arguments, 1));
});	
Highcharts.wrap(Highcharts.Axis.prototype, 'render', function (proceed) {
	proceed.apply(this, [].slice.call(arguments, 1));

	// Do not do this if the chart is not 3D
	if (!this.chart.is3d()) {
		return;
	}

	var chart = this.chart,
		renderer = chart.renderer,
		options3d = chart.options.chart.options3d,
		frame = options3d.frame,
		fbottom = frame.bottom,
		fback = frame.back,
		fside = frame.side,
		depth = options3d.depth,
		height = this.height,
		width = this.width,
		left = this.left,
		top = this.top;

	if (this.isZAxis) {
		return;
	} else if (this.horiz) {
		var bottomShape = {
			x: left,
			y: top + (chart.xAxis[0].opposite ? -fbottom.size : height),
			z: 0,
			width: width,
			height: fbottom.size,
			depth: depth,
			insidePlotArea: false
		};
		if (!this.bottomFrame) {
			this.bottomFrame = renderer.cuboid(bottomShape).attr({
				fill: fbottom.color,
				zIndex: (chart.yAxis[0].reversed && options3d.alpha > 0 ? 4 : -1)
			})
			.css({
				stroke: fbottom.color
			}).add();
		} else {
			this.bottomFrame.animate(bottomShape);
		}
	} else {
		// BACK
		var backShape = {
			x: left + (chart.yAxis[0].opposite ? 0 : -fside.size),
			y: top + (chart.xAxis[0].opposite ? -fbottom.size : 0),
			z: depth,
			width: width + fside.size,
			height: height + fbottom.size,
			depth: fback.size,
			insidePlotArea: false
		};
		if (!this.backFrame) {
			this.backFrame = renderer.cuboid(backShape).attr({
				fill: fback.color, 
				zIndex: -3
			}).css({
				stroke: fback.color
			}).add();
		} else {
			this.backFrame.animate(backShape);
		}
		var sideShape = {
			x: left + (chart.yAxis[0].opposite ? width : -fside.size),
			y: top + (chart.xAxis[0].opposite ? -fbottom.size : 0),
			z: 0,
			width: fside.size,
			height: height + fbottom.size,
			depth: depth,
			insidePlotArea: false
		};
		if (!this.sideFrame) {
			this.sideFrame = renderer.cuboid(sideShape).attr({
				fill: fside.color, 
				zIndex: -2
			}).css({
				stroke: fside.color
			}).add();
		} else {
			this.sideFrame.animate(sideShape);
		}
	}
});

Highcharts.wrap(Highcharts.Axis.prototype, 'getPlotLinePath', function (proceed) {
	var path = proceed.apply(this, [].slice.call(arguments, 1));

	// Do not do this if the chart is not 3D
	if (!this.chart.is3d()) {
		return path;
	}

	if (path === null) { return path; }

	var chart = this.chart,
		options3d = chart.options.chart.options3d;

	var d = this.isZAxis ? this.chart.plotWidth : options3d.depth,
		opposite = this.opposite;
	if (this.horiz) {
		opposite = !opposite;
	}
	var pArr = [
		this.swapZ({ x: path[1], y: path[2], z: (opposite ? d : 0)}),
		this.swapZ({ x: path[1], y: path[2], z: d }),
		this.swapZ({ x: path[4], y: path[5], z: d }),
		this.swapZ({ x: path[4], y: path[5], z: (opposite ? 0 : d)})
	];

	pArr = perspective(pArr, this.chart, false);
	path = this.chart.renderer.toLinePath(pArr, false);

	return path;
});

Highcharts.wrap(Highcharts.Axis.prototype, 'getLinePath', function () {
	// do not draw axislines in 3D ?
	return [];
});

Highcharts.wrap(Highcharts.Axis.prototype, 'getPlotBandPath', function (proceed) {
	// Do not do this if the chart is not 3D
	if (!this.chart.is3d()) {
		return proceed.apply(this, [].slice.call(arguments, 1));
	} else {
		var args = arguments,
			from = args[1],
			to = args[2];
	
		var toPath = this.getPlotLinePath(to),
			path = this.getPlotLinePath(from);
			
		if (path && toPath) {
			path.push(
				'L',
				toPath[10],	// These two do not exist in the regular getPlotLine
				toPath[11],  // ---- # 3005
				'L',
				toPath[7],
				toPath[8],
				'L',
				toPath[4],
				toPath[5],
				'L',
				toPath[1],
				toPath[2]
			);
		} else { // outside the axis area
			path = null;
		}
		
		return path;
	}
});

/*** 
	EXTENSION TO THE TICKS
***/

Highcharts.wrap(Highcharts.Tick.prototype, 'getMarkPath', function (proceed) {
	var path = proceed.apply(this, [].slice.call(arguments, 1));	

	// Do not do this if the chart is not 3D
	if (!this.axis.chart.is3d()) {
		return path;
	}

	var pArr = [
		this.axis.swapZ({x: path[1], y: path[2], z: 0}),
		this.axis.swapZ({x: path[4], y: path[5], z: 0})
	];

	pArr = perspective(pArr, this.axis.chart, false);
	path = [
		'M', pArr[0].x, pArr[0].y,
		'L', pArr[1].x, pArr[1].y
	];
	return path;
});

Highcharts.wrap(Highcharts.Tick.prototype, 'getLabelPosition', function (proceed) {
	var pos = proceed.apply(this, [].slice.call(arguments, 1));

	// Do not do this if the chart is not 3D
	if (!this.axis.chart.is3d()) {
		return pos;
	}

	var new_pos = perspective([this.axis.swapZ({x: pos.x, y: pos.y, z: 0})], this.axis.chart, false)[0];
	new_pos.x = new_pos.x - (!this.axis.horiz && this.axis.opposite ? this.axis.transA : 0); //#3788
	new_pos.old = pos;
	return new_pos;
});

Highcharts.wrap(Highcharts.Tick.prototype, 'handleOverflow', function (proceed, xy) {
	if (this.axis.chart.is3d()) {
		xy = xy.old;
	}
	return proceed.call(this, xy);
});

Highcharts.wrap(Highcharts.Axis.prototype, 'getTitlePosition', function (proceed) {
	var pos = proceed.apply(this, [].slice.call(arguments, 1));

	// Do not do this if the chart is not 3D
	if (!this.chart.is3d()) {
		return pos;
	}

	pos = perspective([this.swapZ({x: pos.x, y: pos.y, z: 0})], this.chart, false)[0];
	return pos;
});

Highcharts.wrap(Highcharts.Axis.prototype, 'drawCrosshair', function (proceed) {
	var args = arguments;
	if (this.chart.is3d()) {
		if (args[2]) {
			args[2] = {
				plotX: args[2].plotXold || args[2].plotX,
				plotY: args[2].plotYold || args[2].plotY
			};
		}
	}
	proceed.apply(this, [].slice.call(args, 1));
});

/***
    Z-AXIS
***/

Highcharts.Axis.prototype.swapZ = function (p, insidePlotArea) {
	if (this.isZAxis) {
		var plotLeft = insidePlotArea ? 0 : this.chart.plotLeft;
		var chart = this.chart;
		return {
			x: plotLeft + (chart.yAxis[0].opposite ? p.z : chart.xAxis[0].width - p.z),
			y: p.y,
			z: p.x - plotLeft
		};
	} else {
		return p;
	}
};

var ZAxis = Highcharts.ZAxis = function () {
	this.isZAxis = true;
	this.init.apply(this, arguments);
};
Highcharts.extend(ZAxis.prototype, Highcharts.Axis.prototype);
Highcharts.extend(ZAxis.prototype, {
	setOptions: function (userOptions) {
		userOptions = Highcharts.merge({
			offset: 0,
			lineWi