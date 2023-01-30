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
Highcharts.SV