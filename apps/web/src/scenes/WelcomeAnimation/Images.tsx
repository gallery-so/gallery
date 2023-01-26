export type AnimatedImage = {
  src?: string;
  width: number;
  // ZIndex is the "depth" of image from viewer's pov.
  // It is used to calculate how the image will move based on mousemovement.
  // z-index of 0 is essentially the axis of movement.
  // values can be -100 to 100, with -100 being the furthest from viewer and 100 being closest.
  // positive values move the image in one direction on mouse movement, negative values move in opposite.
  zIndex: number;
  // Offset is the x or y position of the image after the explosion and they fan out
  offsetX: number;
  offsetY: number;
  // Offset start is the x or y position of the image when they first load in
  offsetXStart: number;
  offsetYStart: number;
  // Delay in ms so that images don't all appear at once
  fadeInDelay: number;
  // Some images have a moveOnVertical property so that they appear in different places on vertical screens
  moveOnVertical?: boolean;
  verticalX?: number;
  verticalY?: number;
};

export const animatedImages: AnimatedImage[] = [
  {
    src: 'https://lh3.googleusercontent.com/AqK0M5EcGCytypy6t5VBclg2Pm66npq4Qpf-MlNox_l1BD8uhDhlircZ5mPCrKch3FAgacTbRO61Ur722W3g-ANWiTMQU6owrnOukQ', // Chair
    width: 180,
    zIndex: -40,
    offsetX: 180,
    offsetY: -370,
    offsetXStart: 0,
    offsetYStart: 0,
    fadeInDelay: 800,
    moveOnVertical: true,
    verticalX: 280,
    verticalY: -180,
  },
  {
    src: 'https://lh3.googleusercontent.com/sxCl9E-dvfOq7UidBi-dO8TDXtU7QmbpVj8x4nXnJpDAujj2c74F1cTqvX5alvInLh9NkaoGFL1aFIvx8M2mRtqQ', // Punk
    width: 100,
    zIndex: -13,
    offsetX: -105,
    offsetY: 210,
    offsetXStart: 0,
    offsetYStart: 0,
    fadeInDelay: 0,
    moveOnVertical: true,
    verticalX: -375,
    verticalY: -50,
  },
  {
    src: 'https://lh3.googleusercontent.com/CpwTm306giMTU90lJrdEqs_SuUWa9DPT7r6CzDJZErJAdbLC8RoB-3GEh_QBtcmPrr6SmsywUPjbO9IN0i6VmwpteirK5ptSePYPzQ=w335', // Fidenza
    width: 280,
    zIndex: -18,
    offsetX: 370,
    offsetY: 80,
    offsetXStart: -20,
    offsetYStart: -12,
    fadeInDelay: 300,
    moveOnVertical: true,
    verticalX: 150,
    verticalY: 100,
  },
  {
    src: 'https://lh3.googleusercontent.com/kghKAvKiZ6dCQaPtfcyuNKnNDNtijiwoalY3ZGeo4WwOyLIZvDeX7auYyiVX2vNKI_GU8Wrt88pLTNNAi5n3ENwsaJ5y2ZWvH0rzMw=w335', // Squiggle
    width: 200,
    zIndex: 20,
    offsetX: -150,
    offsetY: -390,
    offsetXStart: 0,
    offsetYStart: 0,
    fadeInDelay: 0,
    moveOnVertical: true,
    verticalX: -200,
    verticalY: 400,
  },
  {
    src: 'https://lh3.googleusercontent.com/dvrP8rJNswBrdAo4eYia2y808Od_vjtmxn3-41-WDxs2K5jElLUQEsIUGw7X0uGVLe8ywqrUg-70OlrpjIGKiiK4FBy1SyMCmpmIaA=w336', // Elementals
    width: 200,
    zIndex: 11,
    offsetX: -550,
    offsetY: -340,
    offsetXStart: 0,
    offsetYStart: 0,
    fadeInDelay: 1200,
    moveOnVertical: true,
    verticalX: 0,
    verticalY: -350,
  },
  {
    src: 'https://lh3.googleusercontent.com/kOnoQtIQslGFMlxXXGxPtnjCbUvOr1EuIePKC0DJsTsvvV__ytpVoywQ9Fkl8KAxWAwKP2coUj7N-Pk_e_hyTXEKgyzYPJKRcBrULQ=s500', // Brushpops
    width: 250,
    zIndex: 37,
    offsetX: -510,
    offsetY: 110,
    offsetXStart: 0,
    offsetYStart: 30,
    fadeInDelay: 500,
    moveOnVertical: true,
    verticalX: -400,
    verticalY: 100,
  },
  {
    src: 'https://lh3.googleusercontent.com/eseF_p4TBPq0Jauf99fkm32n13Xde_Zgsjdfy6L450YZaEUorYtDmUUHBxcxnC21Sq8mzBJ6uW8uUwYCKckyChysBRNvrWyZ6uSx', // Doge
    width: 220,
    zIndex: 25,
    offsetX: 440,
    offsetY: -240,
    offsetXStart: -40,
    offsetYStart: 0,
    fadeInDelay: 0,
    moveOnVertical: true,
    verticalX: 50,
    verticalY: -600,
  },
  {
    src: 'https://lh3.googleusercontent.com/eg2EsokhN7VkPzzHgO6QHYZHsUaGwhhagLiRhYVIi30Fw2WwudM0NFiGdTAZsLEY99dPuCEo0hdrK6BxZzy6EGXsgSdLL3wA4UMz=w500', // Wheatstacks
    width: 200,
    zIndex: 30,
    offsetX: 80,
    offsetY: 150,
    offsetXStart: 0,
    offsetYStart: -40,
    fadeInDelay: 300,
    moveOnVertical: true,
    verticalX: -100,
    verticalY: 150,
  },
  {
    src: 'https://lh3.googleusercontent.com/G6eilbjTdOHxUcZC3y_O96beaUu_DGzyiduK3HB_7ki94QuZx02xQSz4S-KaDIg-Pw-0YkV1KgC3ECmflEzWq0HoZw', // Rebirth of Venus
    width: 230,
    zIndex: -11,
    offsetX: -660,
    offsetY: -120,
    offsetXStart: 0,
    offsetYStart: 0,
    fadeInDelay: 0,
    moveOnVertical: true,
    verticalX: -300,
    verticalY: -350,
  },
];
