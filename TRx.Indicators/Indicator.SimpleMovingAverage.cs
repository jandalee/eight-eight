using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TRx.Indicators
{
    public static partial class Indicator
    {
        public static double Sma_i(IList<double> p, int period)
        {
            //var window = p.Skip(p.Count - period).Take(period);
            //var sma = window.Average();
            ////var s