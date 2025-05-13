barba.init({
  transitions: [
    {
      name: 'slide-transition',
      async leave(data) {
        await gsap.to(data.current.container, {
          x: '-100%',
          duration: 0.8,
          ease: 'power2.inOut'
        });
      },
      enter(data) {
        gsap.from(data.next.container, {
          x: '100%',
          duration: 0.8,
          ease: 'power2.inOut'
        });
      }
    }
  ]
});