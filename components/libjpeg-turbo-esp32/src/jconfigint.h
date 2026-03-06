/* jconfigint.h - pre-generated for ESP32 (libjpeg-turbo 3.1.1) */

#define BUILD  "20250101"

/* How to hide global symbols. */
#define HIDDEN  __attribute__((visibility("hidden")))

/* Compiler's inline keyword */
#undef inline

/* How to obtain function inlining. */
#define INLINE  __attribute__((always_inline)) inline

/* How to obtain thread-local storage */
#define THREAD_LOCAL  __thread

/* Define to the full name of this package. */
#define PACKAGE_NAME  "libjpeg-turbo"

/* Version number of package */
#define VERSION  "3.1.1"

/* The size of `size_t', as computed by sizeof. */
#define SIZEOF_SIZE_T  4

/* GCC has __builtin_ctzl */
#define HAVE_BUILTIN_CTZL

#if defined(__has_attribute)
#if __has_attribute(fallthrough)
#define FALLTHROUGH  __attribute__((fallthrough));
#else
#define FALLTHROUGH
#endif
#else
#define FALLTHROUGH
#endif

#ifndef BITS_IN_JSAMPLE
#define BITS_IN_JSAMPLE  8
#endif

#undef C_ARITH_CODING_SUPPORTED
#undef D_ARITH_CODING_SUPPORTED
#undef WITH_SIMD

#if BITS_IN_JSAMPLE == 8

/* Support arithmetic encoding */
#define C_ARITH_CODING_SUPPORTED 1

/* Support arithmetic decoding */
#define D_ARITH_CODING_SUPPORTED 1

/* No SIMD */
/* #undef WITH_SIMD */

#endif
