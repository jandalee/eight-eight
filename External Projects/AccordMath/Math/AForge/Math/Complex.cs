// AForge Math Library
// AForge.NET framework
// http://www.aforgenet.com/framework/
//
// Copyright © Andrew Kirillov, 2005-2009
// andrew.kirillov@aforgenet.com
//
// Copyright © Israel Lot, 2008
// israel.lot@gmail.com
//

using System;
using System.Runtime.Serialization;
using System.Text.RegularExpressions;

namespace AForge.Math
{
    /// <summary>
    /// Complex number wrapper class.
    /// </summary>
    /// 
    /// <remarks><para>The class encapsulates complex number and provides
    /// set of different operators to manipulate it, lake adding, subtractio,
    /// multiplication, etc.</para>
    /// 
    /// <para>Sample usage:</para>
    /// <code>
    /// // define two complex numbers
    /// Complex c1 = new Complex( 3, 9 );
    /// Complex c2 = new Complex( 8, 3 );
    /// // sum
    /// Complex s1 = Complex.Add( c1, c2 );
    /// Complex s2 = c1 + c2;
    /// Complex s3 = c1 + 5;
    /// // difference
    /// Complex d1 = Complex.Subtract( c1, c2 );
    /// Complex d2 = c1 - c2;
    /// Complex d3 = c1 - 2;
    /// </code>
    /// </remarks>
    /// 
    public struct Complex : ICloneable, ISerializable
    {
        /// <summary>
        ///  A double-precision complex number that represents zero.
        /// </summary>
        public static readonly Complex Zero = new Complex(0, 0);

        /// <summary>
        ///  A double-precision complex number that represents one.
        /// </summary>
        public static readonly Complex One = new Complex(1, 0);

        /// <summary>
        ///  A double-precision complex number that represents the squere root of (-1).
        /// </summary>
        public static readonly Complex I = new Complex(0, 1);

        /// <summary>
        /// Imaginary part of the complex number.
        /// </summary>
        public double Im;

        /// <summary>
        /// Real part of the complex number.
        /// </summary>
        public double Re;

        /// <summary>
        /// Initializes a new instance of the <see cref="Complex"/> class.
        /// </summary>
        /// 
        /// <param name="re">Real part.</param>
        /// <param name="im">Imaginary part.</param>
        /// 
        public Complex(double re, double im)
        {
            Re = re;
            Im = im;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="Complex"/> class.
        /// </summary>
        /// 
        /// <param name="c">Source complex number.</param>
        /// 
        public Complex(Complex c)
        {
            Re = c.Re;
            Im = c.Im;
        }

        /// <summary>
        /// Magnitude value of the complex number.
        /// </summary>
        /// 
        /// <remarks><para>Magnitude of the complex number, which equals to <b>Sqrt( Re * Re + Im * Im )</b>.</para></remarks>
        /// 
        public double Magnitude
        {
            get { return System.Math.Sqrt(Re*Re + Im*Im); }
        }

        /// <summary>
        /// Phase value of the complex number.
        /// </summary>
        /// 
        /// <remarks><para>Phase of the complex number, which equals to <b>Atan( Im / Re )</b>.</para></remarks>
        /// 
        public double Phase
        {
            get { return System.Math.Atan(Im/Re); }
        }

        /// <summary>
        /// Squared magnitude value of the complex number.
        /// </summary>
        public double SquaredMagnitude
        {
            get { return (Re*Re + Im*Im); }
        }

        #region ICloneable Members

        /// <summary>
        /// Creates an exact copy of this <see cref="Complex"/> object.
        /// </summary>
        /// 
        /// <returns>Returns clone of the complex number.</returns>
        /// 
        object ICloneable.Clone()
        {
            return new Complex(this);
        }

        #endregion

        #region ISerializable Members

        /// <summary>
        /// Populates a <see cref="SerializationInfo"/> with the data needed to serialize the target object.
        /// </summary>
        /// 
        /// <param name="info">The <see cref="SerializationInfo"/> to populate with data. </param>
        /// <param name="context">The destination (see <see cref="StreamingContext"/>) for this serialization.</param>
        /// 
        public void GetObjectData(SerializationInfo info, StreamingContext context)
        {
            info.AddValue("Real", Re);
            info.AddValue("Imaginary", Im);
        }

        #endregion

        /// <summary>
        /// Adds two complex numbers.
        /// </summary>
        /// 
        /// <param name="a">A <see cref="Complex"/> instance.</param>
        /// <param name="b">A <see cref="Complex"/> instance.</param>
        /// 
        /// <returns>Returns new <see cref="Complex"/> instance containing the sum of specified
        /// complex numbers.</returns>
        /// 
        public static Complex Add(Complex a, Complex b)
        {
            return new Complex(a.Re + b.Re, a.Im + b.Im);
        }

        /// <summary>
        /// Adds scalar value to a complex number.
        /// </summary>
        /// 
        /// <param name="a">A <see cref="Complex"/> instance.</param>
        /// <param name="s">A scalar value.</param>
        /// 
        /// <returns>Returns new <see cref="Complex"/> instance containing the sum of specified
        /// complex number and scalar value.</returns>
        /// 
        public static Complex Add(Complex a, double s)
        {
            return new Complex(a.Re + s, a.Im);
        }

        /// <summary>
        /// Adds two complex numbers and puts the result into the third complex number.
        /// </summary>
        /// 
        /// <param name="a">A <see cref="Complex"/> instance.</param>
        /// <param name="b">A <see cref="Complex"/> instance.</param>
        /// <param name="result">A <see cref="Complex"/> instance to hold the result.</param>
        /// 
        public static void Add(Complex a, Complex b, ref Complex result)
        {
            result.Re = a.Re + b.Re;
            result.Im = a.Im + b.Im;
        }

        /// <summary>
        /// Adds scalar value to a complex number and puts the result into another complex number.
        /// </summary>
        /// 
        /// <param name="a">A <see cref="Complex"/> instance.</param>
        /// <param name="s">A scalar value.</param>
        /// <param name="result">A <see cref="Complex"/> instance to hold the result.</param>
        /// 
        public static void Add(Complex a, double s, ref Complex result)
        {
            result.Re = a.Re + s;
            result.Im = a.Im;
        }

        /// <summary>
        /// Subtracts one complex number from another.
        /// </summary>
        /// 
        /// <param name="a">A <see cref="Complex"/> instance to subtract from.</param>
        /// <param name="b">A <see cref="Complex"/> instance to be subtracted.</param>
        /// 
        /// <returns>Returns new <see cref="Complex"/> instance containing the subtraction result (<b>a - b</b>).</returns>
        /// 
        public static Complex Subtract(Complex a, Complex b)
        {
            return new Complex(a.Re - b.Re, a.Im - b.Im);
        }

        /// <summary>
        /// Subtracts a scalar from a complex number.
        /// </summary>
        /// 
        /// <param name="a">A <see cref="Complex"/> instance to subtract from.</param>
        /// <pa