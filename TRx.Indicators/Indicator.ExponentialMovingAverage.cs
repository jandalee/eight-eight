﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

//namespace TSLab.Script.Helpers
namespace TRx.Indicators
{
    public static partial class Indicator
	{
        /// <summary>
        /// EMA(i) = EMA(i−1) + a*(p(i) − EMA(i−1))
        /// EMA(i) = α⋅p(i) + (1 − α)⋅EMA(i−1)
        /// α = 2/(Period + 1) - фактор сглаживания;
        /// </summary>
        /// <param name="p">источник</param>
        /// <param name="period">период</param>
        /// <param name="ema"></param>
        /// <returns></returns>
        public static double Ema_i(List<double> p, double period, List<double> ema)
        {
            double emai = 0;
            try
            {
                double a = 2.0 / (period + 1);
                emai = ema.Last() + a * (p.Last() - ema.Last());
            }
            catch (Exception e)
            {
                //if (period < 0) throw e;
                if (ema.Count == 0)
                {
                    emai = p.Last();
                    //emai = p.Skip(p.Count - (int)period).Take((int)period).Average();
                    return emai;
                }
                else
                    throw e;
            }
            return emai;
            //throw new NotImplementedException();
        }

        /// <summary>
        ///EMA(i) = EMA(i−1) + α⋅(p(i) − EMA(i−1))
        ///EMA(i) = α⋅p(i) + (1 − α)⋅EMA(i−1)
        ///α = 2/(Period + 1) - фактор сглаживания;
        /// </summary>
        /// <param name="p">источник</param>
        /// <param name="period">период</param>
        /// <returns></returns>
        public static IList<double> Ema(IList<double> p, double period)
        {
            int count = p.Count;
            List<double> result = new List<double>();

            for (int i = 0; i < count; i++)
            {
                result.Add(Indicator.Ema_i(p.Take(i + 1).ToList(), period, result));
            }
            return result;
        }

        [System.Obsolete("используйте TRx.Indicators.Indicator.Ema")]
        /// <summary>
        ///EMA(i) = EMA(i−1) + α⋅(p(i) − EMA(i−1))
        ///EMA(i) = α⋅p(i) + (1 − α)⋅EMA(i−1)
        ///α = 2/(Period + 1) - фактор сглаживания;
        /// </summary>
        /// <param name="p">источник</param>
        /// <param name="period">период</param>
        /// <returns></returns>
        public static IList<double> EMA(IList<double> p, double period)
        {
            double[] ema = new double[p.Count];
            double a = 2.0 / (period + 1);
            ema[0] = p[0];
            for (int i = 1; i < p.Count; i++)
            {
                ///EMA(i) = EMA(i−1) + α⋅(p(i) − EMA(i−1))
                ema[i] = ema[i - 1] + a * (p[i] - ema[i - 1]);
            }
            return ema;
        }

        [System.Obsolete("используйте TRx.Indicators.Indicator.Ema")]
        /// <summary>
        /// EMA(i) = EMA(i−1) + α⋅(p(i) − EMA(i−1))
        /// EMA(i) = α⋅p(i) + (1 − α)⋅EMA(i−1)
        /// α = 2/(Period + 1) - фактор сглаживания;
        /// </summary>
        /// <param name="p">источник</param>
        /// <param name="period">период</param>
        /// <returns></returns>
        public static IList<double> EMA_sma0(IList<double> p, double period)
        {
            //IList<double> p = (IList<double>)source;
            List<double> ema = new List<double>();
            ema.Add(p.Take((int)period).Average());

            //ema.Add(p[0]);
            double a = 2.0 / (period + 1);

            for (int i = 1; i < p.Count; i++)
            {
                //double emai = p[i] * a + ema[i - 1] * (1 - a);
                double emai = ema[i - 1] + a * (p[i] - ema[i - 1]);
                ema.Add(emai);
            }
            return ema;
        }
        [System.Obsolete("используйте TRx.Indicators.Indicator.EMA_i")]
        public static double EMA_i(IList<double> p, double period, IList<double> ema)
        {
            double emai = 0;
            if (ema.Count == 0)
            {
                emai = p.Last();
                return emai;
            }
            else
            {
                double a = 2.0 / (period + 1);
                emai = ema.Last() + a * (p.Last() - ema.Last());
            }
            return emai;
            //throw new NotImplementedException();
        }
    }
}

namespace TRx.Indicators.TSLab
{
    /// <summary>
    /// Пример из TSLab.Script.Helpers
    /// </summary>
    public static partial class Indicator
    {
        public static IList<double> EMA(IList<double> candles, int period)
        {
            int count = candles.Count;
            double[] array = new double[count];
            int num = Math.Min(count, period);
            double num2 = 0.0;
            for (int i = 0; i < num; i++)
            {
                num2 += candles[i];
                array[i] = num2 / (double)(i + 1);
            }
            double num3 = 2.0 / (1.0 + (double)period);
            for (int j = num; j < count; j++)
            {
                double num4 = candles[j];
                double num5 = array[j - 1];
                array[j] = num3 * (num4 - num5) + num5;
            }
            return array;
        }
    }
}
