﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TRL.Common.Models;

namespace TRL.Indicators
{
    [System.Obsolete("используйте TRx.Indicators.Indicator.Highest_i")]
    public class Highest
    {
        public static IEnumerable<double> HighCollection(IEnumerable<Bar> src, int period)
        {
            return MakeCollection(src.OrderByDescending(o=>o.DateTime).Select(i => i.High).ToList(), period);
        }

        private static IEnumerable<double> MakeCollection(IEnumerable<double> src, int period)
        {
            List<double> result = new List<double>();

            for (int i = 0; i < src.Count(); i += period)
            {
                result.Add(src.Skip(i).Take(period).Max());
                
                if (result.Count < src.Count())
                {
                    for (int j = 0; j < period - 1; j++)
                    {
                        if (result.Count == src.Count())
                            break;
                        result.Add(result.ElementAt(i));
                    }
                }
            }

            result.Reverse();

            return result;            
        }
    }
}
