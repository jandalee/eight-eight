// AForge Math Library
// AForge.NET framework
// http://www.aforgenet.com/framework/
//
// Copyright © Andrew Kirillov, 2005-2009
// andrew.kirillov@aforgenet.com
//
// FFT idea from Exocortex.DSP library
// http://www.exocortex.org/dsp/
//

using System;

namespace AForge.Math
{
    /// <summary>
    /// Fourier transformation.
    /// </summary>
    /// 
    /// <remarks>The class implements one dimensional and two dimensional
    /// Discrete and Fast Fourier Transformation.</remarks>
    /// 
    public static class FourierTransform
    {
        #region Direction enum

        /// <summary>
        /// Fourier transformation direction.
        /// </summary>
        public enum Direction
        {
            /// <summary>
            /// Forward direction of Fourier transformation.
            /// </summary>
            Forward = 1,

            /// <summary>
            /// Backward direction of Fourier transformation.
            /// </summary>
            Backward = -1
        } ;

        #endregion

        /// <summary>
        /// One dimensional Discrete Fourier Transform.
        /// </summary>
        /// 
        /// <param name="data">Data to transform.</param>
        /// <param name="direction">Transformation direction.</param>
        /// 
        public static void DFT(Complex[] data, Direction direction)
        {
            int n = data.Length;
            double arg, cos, sin;
            var dst = new Complex[n];

            // for each destination element
            for (int i = 0; i < n; i++)
            {
                dst[i] = Complex.Zero;

                arg = -(int) direction*2.0*System.Math.PI*i/n;

                // sum source elements
                for (int j = 0; j < n; j++)
                {
                    cos = System.Math.Cos(j*arg);
                    sin = System.Math.Sin(j*arg);

                    dst[i].Re += (data[j].Re*cos - data[j].Im*sin);
                    dst[i].Im += (data[j].Re*sin + data[j].Im*cos);
                }
            }

            // copy elements
            if (direction == Direction.Forward)
            {
                // devide also for forward transform
                for (int i = 0; i < n; i++)
                {
                    data[i].Re = dst[i].Re/n;
                    data[i].Im = dst[i].Im/n;
                }
            }
            else
            {
                for (int i = 0; i < n; i++)
                {
                    data[i].Re = dst[i].Re;
                    data[i].Im = dst[i].Im;
                }
            }
        }

        /// <summary>
        /// Two dimensional Discrete Fourier Transform.
        /// </summary>
        /// 
        /// <param name="data">Data to transform.</param>
        /// <param name="direction">Transformation direction.</param>
        /// 
        public static void DFT2(Complex[,] data, Direction direction)
        {
            int n = data.GetLength(0); // rows
            int m = data.GetLength(1); // columns
            double arg, cos, sin;
            var dst = new Complex[System.Math.Max(n, m)];

            // process rows
            for (int i = 0; i < n; i++)
            {
                for (int j = 0; j < m; j++)
                {
                    dst[j] = Complex.Zero;

                    arg = -(int) direction*2.0*System.Math.PI*j/m;

                    // sum source elements
                    for (int k = 0; k < m; k++)
                    {
                        cos = System.Math.Cos(k*arg);
                        sin = System.Math.Sin(k*arg);

                        dst[j].Re += (data[i, k].Re*cos - data[i, k].Im*sin);
                        dst[j].Im += (data[i, k].Re*sin + data[i, k].Im*cos);
                    }
                }

                // copy elements
                if (direction == Direction.Forward)
                {
                    // devide also for forward transform
                    for (int j = 0; j < m; j++)
                    {
                        data[i, j].Re = dst[j].Re/m;
                        data[i, j].Im = dst[j].Im/m;
                    }
                }
                else
                {
                    for (int j = 0; j < m; j++)
                    {
                        data[i, j].Re = dst[j].Re;
                        data[i, j].Im = dst[j].Im;
                    }
                }
            }

            // process columns
            for (int j = 0; j < m; j++)
            {
                for (int i = 0; i < n; i++)
                {
                    dst[i] = Complex.Zero;

                    arg = -(int) direction*2.0*System.Math.PI*i/n;

                    // sum source elements
                    for (int k = 0; k < n; k++)
                    {
                        cos = System.Math.Cos(k*arg);
                        sin = System.Math.Sin(k*arg);

                        dst[i].Re += (data[k, j].Re*cos - data[k, j].Im*sin);
                        dst[i].Im += (data[k, j].Re*sin + data[k, j].Im*cos);
                    }
                }

                // copy elements
                if (direction == Direction.Forward)
                {
                    // devide also for forward transform
                    for (int i = 0; i < n; i++)
                    {
                        data[i, j].Re = dst[i].Re/n;
                        data[i, j].Im = dst[i].Im/n;
                    }
                }
                else
                {
                    for (int i = 0; i < n; i++)
                    {
                        data[i, j].Re = dst[i].Re;
                        data[i, j].Im = dst[i].Im;
                    }
                }
            }
        }


        /// <summary>
        /// One dimensional Fast Fourier Transform.
        /// </summary>
        /// 
        /// <param name="data">Data to transform.</param>
        //