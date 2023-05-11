using System;
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
       