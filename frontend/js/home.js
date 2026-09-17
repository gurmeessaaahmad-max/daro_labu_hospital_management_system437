document.addEventListener("DOMContentLoaded", function () {

    /* ==========================================
       MOBILE MENU
    ========================================== */

    const menuButton =
        document.getElementById("menuButton");

    const mainNav =
        document.getElementById("mainNav");


    menuButton.addEventListener(
        "click",
        function () {

            mainNav.classList.toggle("open");

        }
    );


    /* ==========================================
       CLOSE MOBILE MENU
    ========================================== */

    const navLinks =
        document.querySelectorAll(
            "#mainNav a"
        );

    navLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                mainNav.classList.remove(
                    "open"
                );

            }
        );

    });


    /* ==========================================
       ACTIVE NAVIGATION
    ========================================== */

    window.addEventListener(
        "scroll",
        function () {

            const sections =
                document.querySelectorAll(
                    "section[id]"
                );

            const scrollPosition =
                window.scrollY + 150;


            sections.forEach(function (section) {

                const top =
                    section.offsetTop;

                const height =
                    section.offsetHeight;

                const id =
                    section.getAttribute("id");


                if (
                    scrollPosition >= top &&
                    scrollPosition < top + height
                ) {

                    navLinks.forEach(
                        function (link) {

                            link.classList.remove(
                                "active"
                            );

                        }
                    );


                    const activeLink =
                        document.querySelector(
                            '#mainNav a[href="#' +
                            id +
                            '"]'
                        );


                    if (activeLink) {

                        activeLink.classList.add(
                            "active"
                        );

                    }

                }

            });

        }
    );


    /* ==========================================
       CONTACT FORM
    ========================================== */

    const contactForm =
        document.getElementById(
            "contactForm"
        );

    const contactMessage =
        document.getElementById(
            "contactMessage"
        );


    contactForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            contactMessage.textContent =
                "Thank you! Your message has been received.";


            contactForm.reset();


            setTimeout(function () {

                contactMessage.textContent = "";

            }, 5000);

        }
    );


});