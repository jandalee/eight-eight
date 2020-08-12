
﻿// Accord Math Library
// The Accord.NET Framework
// http://accord-net.origo.ethz.ch
//
// Copyright © César Souza, 2009-2011
// cesarsouza at gmail.com
// http://www.crsouza.com
//

using System;

namespace Accord.Math
{
    /// <summary>
    ///   Set of special mathematic functions.
    /// </summary>
    /// <remarks>
    ///   References:
    ///   <list type="bullet">
    ///     <item><description>
    ///       Numerical Recipes in C, 2nd Edition (1992)
    ///     </description></item>
    ///     <item><description>
    ///       Cephes Math Library, http://www.netlib.org/cephes/
    ///     </description></item>
    ///   </list>
    /// </remarks>
    public static class Special
    {
        #region Constants

        /// <summary>Double-precision machine roundoff error.</summary>
        /// <remarks>This value is actually different from Double.Epsilon.</remarks>
        public const double DoubleEpsilon = 1.11022302462515654042E-16;

        /// <summary>Single-precision machine roundoff error.</summary>
        /// <remarks>This value is actually different from Single.Epsilon.</remarks>
        public const float SingleEpsilon = 1.1920929E-07f;

        /// <summary>Maximum log on the machine.</summary>
        public const double LogMax = 7.09782712893383996732E2;

        /// <summary>Minimum log on the machine.</summary>
        public const double LogMin = -7.451332191019412076235E2;

        /// <summary>Maximum gamma on the machine.</summary>
        public const double GammaMax = 171.624376956302725;

        /// <summary>Log of number PI.</summary>
        public const double LogPI = 1.14472988584940017414;

        /// <summary>Square root of number PI.</summary>
        public const double SqrtPI = 2.50662827463100050242E0;

        /// <summary>Square root of 2.</summary>
        public const double Sqrt2 = 1.4142135623730950488016887;

        /// <summary>Half square root of 2.</summary>
        public const double SqrtH = 7.07106781186547524401E-1;

        #endregion

        #region Gamma and related functions

        /// <summary>
        ///   Gamma function of the specified value.
        /// </summary>
        public static double Gamma(double x)
        {
            double[] P =
                {
                    1.60119522476751861407E-4,
                    1.19135147006586384913E-3,
                    1.04213797561761569935E-2,
                    4.76367800457137231464E-2,
                    2.07448227648435975150E-1,
                    4.94214826801497100753E-1,
                    9.99999999999999996796E-1
                };
            double[] Q =
                {
                    -2.31581873324120129819E-5,
                    5.39605580493303397842E-4,
                    -4.45641913851797240494E-3,
                    1.18139785222060435552E-2,
                    3.58236398605498653373E-2,
                    -2.34591795718243348568E-1,
                    7.14304917030273074085E-2,
                    1.00000000000000000320E0
                };

            double p, z;

            double q = System.Math.Abs(x);

            if (q > 33.0)
            {
                if (x < 0.0)
                {
                    p = System.Math.Floor(q);

                    if (p == q)
                        throw new OverflowException();

                    z = q - p;
                    if (z > 0.5)
                    {
                        p += 1.0;
                        z = q - p;
                    }
                    z = q*System.Math.Sin(System.Math.PI*z);

                    if (z == 0.0)
                        throw new OverflowException();

                    z = System.Math.Abs(z);
                    z = System.Math.PI/(z*Stirf(q));

                    return -z;
                }
                else
                {
                    return Stirf(x);
                }
            }

            z = 1.0;
            while (x >= 3.0)
            {
                x -= 1.0;
                z *= x;
            }

            while (x < 0.0)
            {
                if (x == 0.0)
                {
                    throw new ArithmeticException();
                }
                else if (x > -1.0E-9)
                {
                    return (z/((1.0 + 0.5772156649015329*x)*x));
                }
                z /= x;
                x += 1.0;
            }

            while (x < 2.0)
            {
                if (x == 0.0)
                {
                    throw new ArithmeticException();
                }
                else if (x < 1.0E-9)
                {
                    return (z/((1.0 + 0.5772156649015329*x)*x));
                }

                z /= x;
                x += 1.0;
            }

            if ((x == 2.0) || (x == 3.0)) return z;

            x -= 2.0;
            p = Polevl(x, P, 6);
            q = Polevl(x, Q, 7);
            return z*p/q;
        }

        /// <summary>
        ///   Regularized Gamma function (P)
        /// </summary>
        public static double Rgamma(double a, double z)
        {
            return Igam(a, z)/Gamma(a);
        }

        /// <summary>
        ///   Digamma function.
        /// </summary>
        public static double Digamma(double x)
        {
            double s = 0;
            double w = 0;
            double y = 0;
            double z = 0;
            double nz = 0;

            bool negative = false;

            if (x <= 0.0)
            {
                negative = true;
                double q = x;
                double p = (int) System.Math.Floor(q);

                if (p == q)
                    throw new OverflowException("Function computation resulted in arithmetic overflow.");

                nz = q - p;

                if (nz != 0.5)
                {
                    if (nz > 0.5)
                    {
                        p = p + 1.0;
                        nz = q - p;
                    }
                    nz = System.Math.PI/System.Math.Tan(System.Math.PI*nz);
                }
                else
                {
                    nz = 0.0;
                }

                x = 1.0 - x;
            }

            if (x <= 10.0 & x == System.Math.Floor(x))
            {
                y = 0.0;
                var n = (int) System.Math.Floor(x);
                for (int i = 1; i <= n - 1; i++)
                {
                    w = i;
                    y = y + 1.0/w;
                }
                y = y - 0.57721566490153286061;
            }
            else
            {
                s = x;
                w = 0.0;

                while (s < 10.0)
                {
                    w = w + 1.0/s;
                    s = s + 1.0;
                }

                if (s < 1.0E17)
                {
                    z = 1.0/(s*s);

                    double polv = 8.33333333333333333333E-2;
                    polv = polv*z - 2.10927960927960927961E-2;
                    polv = polv*z + 7.57575757575757575758E-3;
                    polv = polv*z - 4.16666666666666666667E-3;
                    polv = polv*z + 3.96825396825396825397E-3;
                    polv = polv*z - 8.33333333333333333333E-3;
                    polv = polv*z + 8.33333333333333333333E-2;
                    y = z*polv;
                }
                else
                {
                    y = 0.0;
                }
                y = System.Math.Log(s) - 0.5/s - y - w;
            }

            if (negative)
            {
                y = y - nz;
            }

            return y;
        }

        /// <summary>
        ///   Gamma function as computed by Stirling's formula.
        /// </summary>
        public static double Stirf(double x)
        {
            double[] STIR =
                {
                    7.87311395793093628397E-4,
                    -2.29549961613378126380E-4,
                    -2.68132617805781232825E-3,
                    3.47222221605458667310E-3,
                    8.33333333333482257126E-2,
                };

            double MAXSTIR = 143.01608;

            double w = 1.0/x;
            double y = System.Math.Exp(x);

            w = 1.0 + w*Polevl(w, STIR, 4);

            if (x > MAXSTIR)
            {
                double v = System.Math.Pow(x, 0.5*x - 0.25);
                y = v*(v/y);
            }
            else
            {
                y = System.Math.Pow(x, x - 0.5)/y;
            }
            y = SqrtPI*y*w;
            return y;
        }

        /// <summary>
        ///   Complemented incomplete gamma function.
        /// </summary>
        public static double Igamc(double a, double x)
        {
            double big = 4.503599627370496e15;
            double biginv = 2.22044604925031308085e-16;
            double ans, ax, c, yc, r, t, y, z;
            double pk, pkm1, pkm2, qk, qkm1, qkm2;

            if (x <= 0 || a <= 0) return 1.0;

            if (x < 1.0 || x < a) return 1.0 - Igam(a, x);

            ax = a*System.Math.Log(x) - x - Lgamma(a);
            if (ax < -LogMax) return 0.0;

            ax = System.Math.Exp(ax);

            /* continued fraction */
            y = 1.0 - a;
            z = x + y + 1.0;
            c = 0.0;
            pkm2 = 1.0;
            qkm2 = x;
            pkm1 = x + 1.0;
            qkm1 = z*x;
            ans = pkm1/qkm1;

            do
            {
                c += 1.0;
                y += 1.0;
                z += 2.0;
                yc = y*c;
                pk = pkm1*z - pkm2*yc;
                qk = qkm1*z - qkm2*yc;
                if (qk != 0)
                {
                    r = pk/qk;
                    t = System.Math.Abs((ans - r)/r);
                    ans = r;
                }
                else
                    t = 1.0;

                pkm2 = pkm1;
                pkm1 = pk;
                qkm2 = qkm1;
                qkm1 = qk;
                if (System.Math.Abs(pk) > big)
                {
                    pkm2 *= biginv;
                    pkm1 *= biginv;
                    qkm2 *= biginv;
                    qkm1 *= biginv;
                }
            } while (t > DoubleEpsilon);

            return ans*ax;
        }

        /// <summary>
        ///   Incomplete gamma function.
        /// </summary>
        public static double Igam(double a, double x)
        {
            double ans, ax, c, r;

            if (x <= 0 || a <= 0) return 0.0;

            if (x > 1.0 && x > a) return 1.0 - Igamc(a, x);

            ax = a*System.Math.Log(x) - x - Lgamma(a);
            if (ax < -LogMax) return (0.0);

            ax = System.Math.Exp(ax);

            r = a;
            c = 1.0;
            ans = 1.0;

            do
            {
                r += 1.0;
                c *= x/r;
                ans += c;
            } while (c/ans > DoubleEpsilon);

            return (ans*ax/a);
        }

        /// <summary>
        ///   Natural logarithm of gamma function.
        /// </summary>
        /// <param name="x"></param>
        /// <returns></returns>
        public static double Lgamma(double x)
        {
            double p, q, w, z;

            double[] A =
                {
                    8.11614167470508450300E-4,
                    -5.95061904284301438324E-4,
                    7.93650340457716943945E-4,
                    -2.77777777730099687205E-3,
                    8.33333333333331927722E-2
                };

            double[] B =
                {
                    -1.37825152569120859100E3,
                    -3.88016315134637840924E4,
                    -3.31612992738871184744E5,
                    -1.16237097492762307383E6,
                    -1.72173700820839662146E6,
                    -8.53555664245765465627E5
                };

            double[] C =
                {
                    -3.51815701436523470549E2,
                    -1.70642106651881159223E4,
                    -2.20528590553854454839E5,
                    -1.13933444367982507207E6,
                    -2.53252307177582951285E6,
                    -2.01889141433532773231E6
                };

            if (x < -34.0)
            {
                q = -x;
                w = Lgamma(q);
                p = System.Math.Floor(q);

                if (p == q)
                    throw new OverflowException("lgamma");

                z = q - p;
                if (z > 0.5)
                {
                    p += 1.0;
                    z = p - q;
                }
                z = q*System.Math.Sin(System.Math.PI*z);

                if (z == 0.0)
                    throw new OverflowException("lgamma");

                z = LogPI - System.Math.Log(z) - w;
                return z;
            }

            if (x < 13.0)
            {
                z = 1.0;
                while (x >= 3.0)
                {
                    x -= 1.0;
                    z *= x;
                }
                while (x < 2.0)
                {
                    if (x == 0.0)
                        throw new OverflowException("lgamma");

                    z /= x;
                    x += 1.0;
                }
                if (z < 0.0) z = -z;
                if (x == 2.0) return System.Math.Log(z);
                x -= 2.0;
                p = x*Polevl(x, B, 5)/P1evl(x, C, 6);
                return (System.Math.Log(z) + p);
            }

            if (x > 2.556348e305)
                throw new OverflowException("lgamma");

            q = (x - 0.5)*System.Math.Log(x) - x + 0.91893853320467274178;
            if (x > 1.0e8) return (q);

            p = 1.0/(x*x);
            if (x >= 1000.0)
            {
                q += ((7.9365079365079365079365e-4*p
                       - 2.7777777777777777777778e-3)*p
                      + 0.0833333333333333333333)/x;
            }
            else
            {
                q += Polevl(p, A, 4)/x;
            }

            return q;
        }

        #endregion

        #region Beta and related functions

        /// <summary>
        ///   Beta function as gamma(a) * gamma(b) / gamma(a+b).
        /// </summary>
        public static double Beta(double a, double b)
        {
            return System.Math.Exp(Lbeta(a, b));
        }

        /// <summary>
        ///   Natural logarithm of the Beta function.
        /// </summary>
        public static double Lbeta(double a, double b)
        {
            return Lgamma(a) + Lgamma(b) - Lgamma(a + b);
        }

        /// <summary>
        ///   Incomplete (regularized) beta function evaluated from zero to xx.
        /// </summary>
        public static double Ibeta(double aa, double bb, double xx)
        {
            double a, b, t, x, xc, w, y;
            bool flag;

            if (aa <= 0.0)
                throw new ArgumentOutOfRangeException("aa", "domain error");
            if (bb <= 0.0)
                throw new ArgumentOutOfRangeException("bb", "domain error");

            if ((xx <= 0.0) || (xx >= 1.0))
            {
                if (xx == 0.0) return 0.0;
                if (xx == 1.0) return 1.0;
                throw new ArgumentOutOfRangeException("xx", "domain error");
            }

            flag = false;
            if ((bb*xx) <= 1.0 && xx <= 0.95)
            {
                t = PowerSeries(aa, bb, xx);
                return t;
            }

            w = 1.0 - xx;

            if (xx > (aa/(aa + bb)))
            {
                flag = true;
                a = bb;
                b = aa;
                xc = xx;
                x = w;
            }
            else
            {
                a = aa;
                b = bb;
                xc = w;
                x = xx;
            }

            if (flag && (b*x) <= 1.0 && x <= 0.95)
            {
                t = PowerSeries(a, b, x);
                if (t <= DoubleEpsilon) t = 1.0 - DoubleEpsilon;
                else t = 1.0 - t;
                return t;
            }

            y = x*(a + b - 2.0) - (a - 1.0);
            if (y < 0.0)
                w = Incbcf(a, b, x);
            else
                w = Incbd(a, b, x)/xc;


            y = a*System.Math.Log(x);
            t = b*System.Math.Log(xc);
            if ((a + b) < GammaMax && System.Math.Abs(y) < LogMax && System.Math.Abs(t) < LogMax)
            {
                t = System.Math.Pow(xc, b);
                t *= System.Math.Pow(x, a);
                t /= a;
                t *= w;
                t *= Gamma(a + b)/(Gamma(a)*Gamma(b));
                if (flag)
                {
                    if (t <= DoubleEpsilon) t = 1.0 - DoubleEpsilon;
                    else t = 1.0 - t;
                }
                return t;
            }

            y += t + Lgamma(a + b) - Lgamma(a) - Lgamma(b);
            y += System.Math.Log(w/a);
            if (y < LogMin)
                t = 0.0;
            else
                t = System.Math.Exp(y);

            if (flag)
            {
                if (t <= DoubleEpsilon) t = 1.0 - DoubleEpsilon;
                else t = 1.0 - t;
            }
            return t;
        }

        /// <summary>
        ///   Continued fraction expansion #1 for incomplete beta integral.
        /// </summary>
        public static double Incbcf(double a, double b, double x)
        {
            double xk, pk, pkm1, pkm2, qk, qkm1, qkm2;
            double k1, k2, k3, k4, k5, k6, k7, k8;
            double r, t, ans, thresh;
            int n;
            double big = 4.503599627370496e15;
            double biginv = 2.22044604925031308085e-16;

            k1 = a;
            k2 = a + b;
            k3 = a;
            k4 = a + 1.0;
            k5 = 1.0;
            k6 = b - 1.0;
            k7 = k4;
            k8 = a + 2.0;

            pkm2 = 0.0;
            qkm2 = 1.0;
            pkm1 = 1.0;
            qkm1 = 1.0;
            ans = 1.0;
            r = 1.0;
            n = 0;
            thresh = 3.0*DoubleEpsilon;

            do
            {
                xk = -(x*k1*k2)/(k3*k4);
                pk = pkm1 + pkm2*xk;
                qk = qkm1 + qkm2*xk;
                pkm2 = pkm1;
                pkm1 = pk;
                qkm2 = qkm1;
                qkm1 = qk;

                xk = (x*k5*k6)/(k7*k8);
                pk = pkm1 + pkm2*xk;
                qk = qkm1 + qkm2*xk;
                pkm2 = pkm1;
                pkm1 = pk;
                qkm2 = qkm1;
                qkm1 = qk;

                if (qk != 0) r = pk/qk;
                if (r != 0)
                {
                    t = System.Math.Abs((ans - r)/r);
                    ans = r;
                }
                else
                    t = 1.0;

                if (t < thresh) return ans;

                k1 += 1.0;
                k2 += 1.0;
                k3 += 2.0;
                k4 += 2.0;
                k5 += 1.0;
                k6 -= 1.0;
                k7 += 2.0;
                k8 += 2.0;

                if ((System.Math.Abs(qk) + System.Math.Abs(pk)) > big)
                {
                    pkm2 *= biginv;
                    pkm1 *= biginv;
                    qkm2 *= biginv;
                    qkm1 *= biginv;
                }
                if ((System.Math.Abs(qk) < biginv) || (System.Math.Abs(pk) < biginv))
                {
                    pkm2 *= big;
                    pkm1 *= big;
                    qkm2 *= big;
                    qkm1 *= big;
                }
            } while (++n < 300);

            return ans;
        }

        /// <summary>
        ///   Continued fraction expansion #2 for incomplete beta integral.
        /// </summary>
        public static double Incbd(double a, double b, double x)
        {
            double xk, pk, pkm1, pkm2, qk, qkm1, qkm2;
            double k1, k2, k3, k4, k5, k6, k7, k8;
            double r, t, ans, z, thresh;
            int n;
            double big = 4.503599627370496e15;
            double biginv = 2.22044604925031308085e-16;

            k1 = a;
            k2 = b - 1.0;
            k3 = a;
            k4 = a + 1.0;
            k5 = 1.0;
            k6 = a + b;
            k7 = a + 1.0;
            ;
            k8 = a + 2.0;

            pkm2 = 0.0;
            qkm2 = 1.0;
            pkm1 = 1.0;
            qkm1 = 1.0;
            z = x/(1.0 - x);
            ans = 1.0;
            r = 1.0;
            n = 0;
            thresh = 3.0*DoubleEpsilon;
            do
            {
                xk = -(z*k1*k2)/(k3*k4);
                pk = pkm1 + pkm2*xk;
                qk = qkm1 + qkm2*xk;
                pkm2 = pkm1;
                pkm1 = pk;
                qkm2 = qkm1;
                qkm1 = qk;

                xk = (z*k5*k6)/(k7*k8);
                pk = pkm1 + pkm2*xk;
                qk = qkm1 + qkm2*xk;
                pkm2 = pkm1;
                pkm1 = pk;
                qkm2 = qkm1;
                qkm1 = qk;

                if (qk != 0) r = pk/qk;
                if (r != 0)
                {
                    t = System.Math.Abs((ans - r)/r);
                    ans = r;
                }
                else
                    t = 1.0;

                if (t < thresh) return ans;

                k1 += 1.0;
                k2 -= 1.0;
                k3 += 2.0;
                k4 += 2.0;
                k5 += 1.0;
                k6 += 1.0;
                k7 += 2.0;
                k8 += 2.0;

                if ((System.Math.Abs(qk) + System.Math.Abs(pk)) > big)
                {
                    pkm2 *= biginv;
                    pkm1 *= biginv;
                    qkm2 *= biginv;
                    qkm1 *= biginv;
                }
                if ((System.Math.Abs(qk) < biginv) || (System.Math.Abs(pk) < biginv))
                {
                    pkm2 *= big;
                    pkm1 *= big;
                    qkm2 *= big;
                    qkm1 *= big;
                }
            } while (++n < 300);

            return ans;
        }

        /// <summary>
        ///   Power series for incomplete beta integral. Use when b*x
        ///   is small and x not too close to 1.
        /// </summary>
        public static double PowerSeries(double a, double b, double x)
        {
            double s, t, u, v, n, t1, z, ai;

            ai = 1.0/a;
            u = (1.0 - b)*x;
            v = u/(a + 1.0);
            t1 = v;
            t = u;
            n = 2.0;
            s = 0.0;
            z = DoubleEpsilon*ai;
            while (System.Math.Abs(v) > z)
            {
                u = (n - b)*x/n;
                t *= u;
                v = t/(a + n);
                s += v;
                n += 1.0;
            }
            s += t1;
            s += ai;

            u = a*System.Math.Log(x);
            if ((a + b) < GammaMax && System.Math.Abs(u) < LogMax)
            {
                t = Gamma(a + b)/(Gamma(a)*Gamma(b));
                s = s*t*System.Math.Pow(x, a);
            }
            else
            {
                t = Lgamma(a + b) - Lgamma(a) - Lgamma(b) + u + System.Math.Log(s);
                if (t < LogMin) s = 0.0;
                else s = System.Math.Exp(t);
            }
            return s;
        }

        #endregion

        #region Probability distributions and related functions

        /// <summary>
        ///   Chi-square function (left hand tail).
        /// </summary>
        /// <remarks>
        ///   Returns the area under the left hand tail (from 0 to x)
        ///   of the Chi square probability density function with
        ///   df degrees of freedom.
        /// </remarks>
        /// <param name="df">degrees of freedom</param>
        /// <param name="x">double value</param>
        /// <returns></returns>
        public static double ChiSq(double df, double x)
        {
            if (x < 0.0 || df < 1.0) return 0.0;

            return Igam(df/2.0, x/2.0);
        }

        /// <summary>
        ///  Chi-square function (right hand tail).
        /// </summary>
        /// <remarks>
        ///  Returns the area under the right hand tail (from x to
        ///  infinity) of the Chi square probability density function
        ///  with df degrees of freedom:
        /// </remarks>
        /// <param name="df">degrees of freedom</param>
        /// <param name="x">double value</param>
        /// <returns></returns>
        public static double ChiSqc(double df, double x)
        {
            if (x < 0.0 || df < 1.0) return 0.0;

            return Igamc(df/2.0, x/2.0);
        }

        /// <summary>
        ///   Sum of the first k terms of the Poisson distribution.
        /// </summary>