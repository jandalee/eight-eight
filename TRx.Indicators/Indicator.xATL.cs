
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
        public static IList<double> FATL(IList<double> src)
        {
            double[] result = new double[src.Count];
            double[] filter = new double[]
            {
                0.436040945,
                0.3658689069,
                0.2460452079,
                0.1104506886,
                -0.0054034585,
                -0.0760367731,
                -0.0933058722,
                -0.0670110374,
                -0.0190795053,
                0.0259609206,
                0.0502044896,
                0.0477818607,
                0.0249252327,
                -0.0047706151,
                -0.0272432537,
                -0.0338917071,
                -0.0244141482,
                -0.0055774838,
                0.0128149838,
                0.0226522218,
                0.0208778257,
                0.0100299086,
                -0.0036771622,
                -0.013674485,
                -0.0160483392,
                -0.0108597376,
                -0.0016060704,
                0.0069480557,
                0.0110573605,
                0.0095711419,
                0.0040444064,
                -0.0023824623,
                -0.0067093714,
                -0.00720034,
                -0.004771771,
                0.0005541115,
                0.000786016,
                0.0130129076,
                0.0040364019
            };

            for (int j = 0; j < src.Count; j++)
            {
                result[j] = xATLi(src, filter, j);
            }

            return result;
        }

        public static IList<double> SATL(IList<double> src)
        {
            double[] result = new double[src.Count];
            double[] filter = new double[]
            {
                0.0982862174,
                0.0975682269,
                0.0961401078,
                0.0940230544,
                0.091243709,
                0.0878391006,
                0.0838544303,
                0.079340635,
                0.0743569346,
                0.0689666682,
                0.0632381578,
                0.0572428925,
                0.0510534242,
                0.0447468229,
                0.038395995,
                0.0320735368,
                0.0258537721,
                0.0198005183,
                0.0139807863,
                0.0084512448,
                0.0032639979,
                -0.0015350359,
                -0.0059060082,
                -0.0098190256,
                -0.0132507215,
                -0.0161875265,
                -0.0186164872,
                -0.0205446727,
                -0.0219739146,
                -0.0229204861,
                -0.0234080863,
                -0.0234566315,
                -0.0231017777,
                -0.02237969,
                -0.0213300463,
                -0.0199924534,
                -0.0184126992,
                -0.0166377699,
                -0.0147139428,
                -0.0126796776,
                -0.0105938331,
                -0.008473677,
                -0.006384185,
                -0.0043466731,
                -0.0023956944,
                -0.000553518,
                0.0011421469,
                0.0026845693,
                0.0040471369,
                0.0052380201,
                0.0062194591,
                0.0070340085,
                0.0076266453,
                0.0080376628,
                0.0083037666,
                0.0083694798,
                0.0082901022,
                0.0080741359,
                0.007754382,
                0.0073260526,
                0.0068163569,
                0.0062325477,
                0.0056078229,
                0.0049516078,
                0.0161380976
            };

            for (int j = 0; j < src.Count; j++)
            {
                result[j] = xATLi(src, filter, j);
            }

            return result;
        }

        private static double xATLi(IList<double> src, double[] filter, int j)
        {
            double result = 0;
            //if (j < 39)
            if (j < filter.Length)
            {
                result = src[j];
            }
            else
            {
                //for (int k = 0; k < 39; k++)
                for (int k = 0; k < filter.Length; k++)
                {
                    result += filter[k] * src[j - k];
                }
            }
            return result;
        }
    }
}