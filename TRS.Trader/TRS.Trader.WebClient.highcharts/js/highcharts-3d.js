/*
 Highcharts JS v4.1.7 (2015-06-26)

 (c) 2009-2013 Torstein Hønsi

 License: www.highcharts.com/license
*/
(function(d){function n(c,a,b){var e,f,g=a.options.chart.options3d,i=!1;b?(i=a.inverted,b=a.plotWidth/2,a=a.plotHeight/2,e=g.depth/2,f=y(g.depth,1)*y(g.viewDistance,0)):(b=a.plotLeft+a.plotWidth/2,a=a.plotTop+a.plotHeight/2,e=g.depth/2,f=y(g.depth,1)*y(g.viewDistance,0));var j=[],h=b,k=a,v=e,p=f,b=x*(i?g.beta:-g.beta),g=x*(i?-g.alpha:g.alpha),q=l(b),s=m(b),t=l(g),u=m(g),w,B,r,n,o,z;d.each(c,function(a){w=(i?a.y:a.x)-h;B=(i?a.x:a.y)-k;r=(a.z||0)-v;n=s*w-q*r;o=-q*t*w-s*t*r+u*B;z=q*u*w+s*u*r+t*B;p>0&&
p<Number.POSITIVE_INFINITY&&(n*=p/(z+v+p),o*=p/(z+v+p));n+=h;o+=k;z+=v;j.push({x:i?o:n,y:i?n:o,z:z})});return j}function o(c){return c!==void 0&&c!==null}function E(c){var a=0,b,e;for(b=0;b<c.length;b++)e=(b+1)%c.length,a+=c[b].x*c[e].y-c[e].x*c[b].y;return a/2}function C(c){var a=0,b;for(b=0;b<c.length;b++)a+=c[b].z;return c.length?a/c.length:0}function r(c,a,b,e,f,g,d,j){var h=[];return g>f&&g-f>q/2+1.0E-4?(h=h.concat(r(c,a,b,e,f,f+q/2,d,j)),h=h.concat(r(c,a,b,e,f+q/2,g,d,j))):g<f&&f-g>q/2+1.0E-4?
(h=h.concat(r(c,a,b,e,f,f-q/2,d,j)),h=h.concat(r(c,a,b,e,f-q/2,g,d,j))):(h=g-f,["C",c+b*m(f)-b*A*h*l(f)+d,a+e*l(f)+e*A*h*m(f)+j,c+b*m(g)+b*A*h*l(g)+d,a+e*l(g)-e*A*h*m(g)+j,c+b*m(g)+d,a+e*l(g)+j])}function F(c){if(this.chart.is3d()){var a=this.chart.options.plotOptions.column.grouping;if(a!==void 0&&!a&&this.group.zIndex!==void 0&&!this.zIndexSet)this.group.attr({zIndex:this.group.zIndex*10}),this.zIndexSet=!0;var b=this.options,e=this.options.states;this.borderWidth=b.borderWidth=o(b.edgeWidth)?b.edgeWidth:
1;d.each(this.data,function(a){if(a.y!==null)a=a.pointAttr,this.borderColor=d.pick(b.edgeColor,a[""].fill),a[""].stroke=this.borderColor,a.hover.stroke=d.pick(e.hover.edgeColor,this.borderColor),a.select.stroke=d.pick(e.select.edgeColor,this.borderColor)})}c.apply(this,[].slice.call(arguments,1))}var q=Math.PI,x=q/180,l=Math.sin,m=Math.cos,y=d.pick,G=Math.round;d.perspective=n;var A=4*(Math.sqrt(2)-1)/3/(q/2);d.SVGRenderer.prototype.toLinePath=function(c,a){var b=[];d.each(c,function(a){b.push("L",
a.x,a.y)});c.length&&(b[0]="M",a&&b.push("Z"));return b};d.SVGRenderer.prototype.cuboid=function(c){var a=this.g(),c=this.cuboidPath(c);a.front=this.path(c[0]).attr({zIndex:c[3],"stroke-linejoin":"round"}).add(a);a.top=this.path(c[1]).attr({zIndex:c[4],"stroke-linejoin":"round"}).add(a);a.side=this.path(c[2]).attr({zIndex:c[5],"stroke-linejoin":"round"}).add(a);a.fillSetter=function(a){var c=d.Color(a).brighten(0.1).get(),f=d.Color(a).brighten(-0.1).get();this.front.attr({fill:a});this.top.attr({fill:c});
this.side.attr({fill:f});this.color=a;return this};a.opacitySetter=function(a){this.front.attr({opacity:a});this.top.attr({opacity:a});this.side.attr({opacity:a});return this};a.attr=function(a){a.shapeArgs||o(a.x)?(a=this.renderer.cuboidPath(a.shapeArgs||a),this.front.attr({d:a[0],zIndex:a[3]}),this.top.attr({d:a[1],zIndex:a[4]}),this.side.attr({d:a[2],zIndex:a[5]})):d.SVGElement.prototype.attr.call(this,a);return this};a.animate=function(a,c,f){o(a.x)&&o(a.y)?(a=this.renderer.cuboidPath(a),this.front.attr({zIndex:a[3]}).animate({d:a[0]},
c,f),this.top.attr({zIndex:a[4]}).animate({d:a[1]},c,f),this.side.attr({zIndex:a[5]}).animate({d:a[2]},c,f)):a.opacity?(this.front.animate(a,c,f),this.top.animate(a,c,f),this.side.animate(a,c,f)):d.SVGElement.prototype.animate.call(this,a,c,f);return this};a.destroy=function(){this.front.destroy();this.top.destroy();this.side.destroy();return null};a.attr({zIndex:-c[3]});return a};d.SVGRenderer.prototype.cuboidPath=function(c){var a=c.x,b=c.y,e=c.z,f=c.height,g=c.width,i=c.depth,j=d.map,h=[{x:a,y:b,
z:e},{x:a+g,y:b,z:e},{x:a+g,y:b+f,z:e},{x:a,y:b+f,z:e},{x:a,y:b+f,z:e+i},{x:a+g,y:b+f,z:e+i},{x:a+g,y:b,z:e+i},{x:a,y:b,z:e+i}],h=n(h,d.charts[this.chartIndex],c.insidePlotArea),b=function(a,b){a=j(a,function(a){return h[a]});b=j(b,function(a){return h[a]});return E(a)<0?a:E(b)<0?b:[]},c=b([3,2,1,0],[7,6,5,4]),a=b([1,6,7,0],[4,5,2,3]),b=b([1,2,5,6],[0,7,4,3]);return[this.toLinePath(c,!0),this.toLinePath(a,!0),this.toLinePath(b,!0),C(c),C(a),C(b)]};d.SVGRenderer.prototype.arc3d=function(c){c.alpha*=
x;c.beta*=x;var a=this.g(),b=this.arc3dPath(c),e=a.renderer,f=b.zTop*100;a.shapeArgs=c;a.top=e.path(b.top).setRadialReference(c.center).attr({zIndex:b.zTop}).add(a);a.side1=e.path(b.side2).attr({zIndex:b.zSide1});a.side2=e.path(b.side1).attr({zIndex:b.zSide2});a.inn=e.path(b.inn).attr({zIndex:b.zInn});a.out=e.path(b.out).attr({zIndex:b.zOut});a.fillSetter=function(a){this.color=a;var b=d.Color(a).brighten(-0.1).get();this.side1.attr({fill:b});this.side2.attr({fill:b});this.inn.attr({fill:b});this.out.attr({fill:b});
this.top.attr({fill:a});return this};a.translateXSetter=function(a){this.out.attr({translateX:a});this.inn.attr({translateX:a});this.side1.attr({translateX:a});this.side2.attr({translateX:a});this.top.attr({translateX:a})};a.translateYSetter=function(a){this.out.attr({translateY:a});this.inn.attr({translateY:a});this.side1.attr({translateY:a});this.side2.attr({translateY:a});this.top.attr({translateY:a})};a.animate=function(a,b,c){o(a.end)||o(a.start)?(this._shapeArgs=this.shapeArgs,d.SVGElement.prototype.animate.call(this,
{_args:a},{duration:b,step:function(){var a=arguments[1],b=a.elem,c=b._shapeArgs,e=a.end,a=a.pos,c=d.merge(c,{x:c.x+(e.x-c.x)*a,y:c.y+(e.y-c.y)*a,r:c.r+(e.r-c.r)*a,innerR:c.innerR+(e.innerR-c.innerR)*a,start:c.start+(e.start-c.start)*a,end:c.end+(e.end-c.end)*a}),e=b.renderer.arc3dPath(c);b.shapeArgs=c;b.top.attr({d:e.top,zIndex:e.zTop});b.inn.attr({d:e.inn,zIndex:e.zInn});b.out.attr({d:e.out,zIndex:e.zOut});b.side1.attr({d:e.side1,zIndex:e.zSide1});b.side2.attr({d:e.side2,zIndex:e.zSide2})}},c)):
d.SVGElement.prototype.animate.call(this,a,b,c);return this};a.destroy=function(){this.top.destroy();this.out.destroy();this.inn.destroy();this.side1.destroy();this.side2.destroy();d.SVGElement.prototype.destroy.call(this)};a.hide=function(){this.top.hide();this.out.hide();this.inn.hide();this.side1.hide();this.side2.hide()};a.show=function(){this.top.show();this.out.show();this.inn.show();this.side1.show();this.side2.show()};a.zIndex=f;a.attr({zIndex:f});return a};d.SVGRenderer.prototype.arc3dPath=
function(c){var a=c.x,b=c.y,e=c.start,d=c.end-1.0E-5,g=c.r,i=c.innerR,j=c.depth,h=c.alpha,k=c.beta,v=m(e),p=l(e),c=m(d),n=l(d),s=g*m(k),t=g*m(h),u=i*m(k);i*=m(h);var w=j*l(k),o=j*l(h),j=["M",a+s*v,b+t*p],j=j.concat(r(a,b,s,t,e,d,0,0)),j=j.concat(["L",a+u*c,b+i*n]),j=j.concat(r(a,b,u,i,d,e,0,0)),j=j.concat(["Z"]),k=k>0?q/2:0,h=h>0?0:q/2,k=e>-k?e:d>-k?-k:e,x=d<q-h?d:e<q-h?q-h:d,h=["M",a+s*m(k),b+t*l(k)],h=h.concat(r(a,b,s,t,k,x,0,0)),h=h.concat(["L",a+s*m(x)+w,b+t*l(x)+o]),h=h.concat(r(a,b,s,t,x,k,
w,o)),h=h.concat(["Z"]),k=["M",a+u*v,b+i*p],k=k.concat(r(a,b,u,i,e,d,0,0)),k=k.concat(["L",a+u*m(d)+w,b+i*l(d)+o]),k=k.concat(r(a,b,u,i,d,e,w,o)),k=k.concat(["Z"]),v=["M",a+s*v,b+t*p,"L",a+s*v+w,b+t*p+o,"L",a+u*v+w,b+i*p+o,"L",a+u*v,b+i*p,"Z"],a=["M",a+s*c,b+t*n,"L",a+s*c+w,b+t*n+o,"L",a+u*c+w,b+i*n+o,"L",a+u*c,b+i*n,"Z"],b=l((e+d)/2),e=l(e),d=l(d);return{top:j,zTop:g,out:h,zOut:Math.max(b,e,d)*g,inn:k,zInn:Math.max(b,e,d)*g,side1:v,zSide1:e*g*0.99,side2:a,zSide2:d*g*0.99}};d.Chart.prototype.is3d=
function(){return this.options.chart.options3d&&this.options.chart.options3d.enabled};d.wrap(d.Chart.prototype,"isInsidePlot",function(c){return this.is3d()?!0:c.apply(this,[].slice.call(arguments,1))});d.getOptions().chart.options3d={enabled:!1,alpha:0,beta:0,depth:100,viewDistance:25,frame:{bottom:{size:1,color:"rgba(255,255,255,0)"},side:{size:1,color:"rgba(255,255,255,0)"},back:{size:1,color:"rgba(255,255,255,0)"}}};d.wrap(d.Chart.prototype,"init",function(c){var a=[].slice.call(arguments,1),
b;if(a[0].chart.options3d&&a[0].chart.options3d.enabled)b=a[0].plotOptions||{},b=b.pie||{},b.borderColor=d.pick(b.borderColor,void 0);c.apply(this,a)});d.wrap(d.Chart.prototype,"setChartSize",function(c){c.apply(this,[].slice.call(arguments,1));if(this.is3d()){var a=this.inverted,b=this.clipBox,d=this.margin;b[a?"y":"x"]=-(d[3]||0);b[a?"x":"y"]=-(d[0]||0);b[a?"height":"width"]=this.chartWidth+(d[3]||0)+(d[1]||0);b[a?"width":"height"]=this.chartHeight+(d[0]||0)+(d[2]||0)}});d.wrap(d.Chart.prototype,
"redraw",function(c){if(this.is3d())this.isDirtyBox=!0;c.apply(this,[].slice.call(arguments,1))});d.wrap(d.Chart.prototype,"renderSeries",function(c){var a=this.series.length;if(this.is3d())for(;a--;)c=this.series[a],c.translate(),c.render();else c.call(this)});d.Chart.prototype.retrieveStacks=function(c){var a=this.series,b={},e,f=1;d.each(this.series,function(d){e=c?d.options.stack||0:a.length-1-d.index;b[e]?b[e].series.push(d):(b[e]={series:[d],position:f},f++)});b.totalStacks=f+1;return b};d.wrap(d.Axis.prototype,
"init",function(c){var a=arguments;if(a[1].is3d())a[2].tickWidth=d.pick(a[2].tickWidth,0),a[2].gridLineWidth=d.pick(a[2].gridLineWidth,1);c.apply(this,[].slice.call(arguments,1))});d.wrap(d.Axis.prototype,"render",function(c){c.apply(this,[].slice.call(arguments,1));if(this.chart.is3d()){var a=this.chart,b=a.renderer,d=a.options.chart.options3d,f=d.frame,g=f.bottom,i=f.back,f=f.side,j=d.depth,h=this.height,k=this.width,l=this.left,p=this.top;if(!this.isZAxis)this.horiz?(i={x:l,y:p+(a.xAxis[0].opposite?
-g.size:h),z:0,width:k,height:g.size,depth:j,insidePlotArea:!1},this.bottomFrame?this.bottomFrame.animate(i):this.bottomFrame=b.cuboid(i).attr({fill:g.color,zIndex:a.yAxis[0].reversed&&d.alpha>0?4:-1}).css({stroke:g.color}).add()):(d={x:l+(a.yAxis[0].opposite?0:-f.size),y:p+(a.xAxis[0].opposite?-g.size:0),z:j,width:k+f.size,height:h+g.size,depth:i.size,insidePlotArea:!1},this.backFrame?this.backFrame.animate(d):this.backFrame=b.cuboid(d).attr({fill:i.color,zIndex:-3}).css({stroke:i.color}).add(),
a={x:l+(a.yAxis[0].opposite?k:-f.size),y:p+(a.xAxis[0].opposite?-g.size:0),z:0,width:f.size,height:h+g.size,depth:j,insidePlotArea:!1},this.sideFrame?this.sideFrame.animate(a):this.sideFrame=b.cuboid(a).attr({fill:f.color,zIn