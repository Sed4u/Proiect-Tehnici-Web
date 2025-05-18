document.addEventListener("DOMContentLoaded", () => {
    const MAX_COMPARE = 2;

    const container = document.createElement("div");
    container.id = "container-comparatie";
    container.className = "position-fixed bottom-0 end-0 bg-white border border-dark p-3 zindex-tooltip rounded shadow";
    container.style.maxWidth = "300px";
    container.style.display = "none";
    document.body.appendChild(container);

    function incarcaProduseComparate() {
        const produse = JSON.parse(localStorage.getItem("produseComparate") || "[]");
        container.innerHTML = "";

        if (produse.length > 0) {
            produse.forEach(prod => {
                const wrapper = document.createElement("div");
                wrapper.className = "d-flex align-items-center justify-content-between mb-2";

                const nume = document.createElement("span");
                nume.textContent = prod.nume;

                const btnSterge = document.createElement("button");
                btnSterge.textContent = "×";
                btnSterge.className = "btn btn-sm btn-danger ms-2";
                btnSterge.setAttribute("aria-label", `Șterge produsul ${prod.nume}`);
                btnSterge.onclick = () => stergeProdusComparat(prod.id);

                wrapper.appendChild(nume);
                wrapper.appendChild(btnSterge);
                container.appendChild(wrapper);
            });

            if (produse.length === MAX_COMPARE) {
                const btnAfisare = document.createElement("button");
                btnAfisare.className = "btn btn-success w-100 mt-3";
                btnAfisare.textContent = "Afișează comparația";
                btnAfisare.onclick = () => {
                    const url = `/compara/${produse[0].id}/${produse[1].id}`;
                    window.location.href = url;
                };
                container.appendChild(btnAfisare);
            }

            container.style.display = "block";
        } else {
            container.style.display = "none";
        }
    }

    function stergeProdusComparat(id) {
        let produse = JSON.parse(localStorage.getItem("produseComparate") || "[]");
        produse = produse.filter(prod => prod.id !== id);
        localStorage.setItem("produseComparate", JSON.stringify(produse));
        incarcaProduseComparate();
        actualizeazaStareaButoanelor();
    }

    function adaugaProdusComparat(id, nume) {
        const produse = JSON.parse(localStorage.getItem("produseComparate") || "[]");
        if (produse.length >= MAX_COMPARE || produse.find(p => p.id === id)) return;

        produse.push({ id, nume });
        localStorage.setItem("produseComparate", JSON.stringify(produse));
        incarcaProduseComparate();
        actualizeazaStareaButoanelor();
    }

    function actualizeazaStareaButoanelor() {
        const produse = JSON.parse(localStorage.getItem("produseComparate") || "[]");
        const disable = produse.length >= MAX_COMPARE;
        document.querySelectorAll(".btn-compare").forEach(btn => {
            const id = btn.getAttribute("data-id");
            const esteSelectat = produse.find(p => p.id === id);
            btn.disabled = disable && !esteSelectat;
            btn.classList.toggle("opacity-50", btn.disabled);
        });
    }

    document.querySelectorAll(".btn-compare").forEach(btn => {
        btn.addEventListener("click", () => {
            const cardProdus = btn.closest(".produs");
            const id = cardProdus?.dataset.id;
            const nume = cardProdus?.dataset.nume;
            if (id && nume) adaugaProdusComparat(id, nume);
        });
    });

    incarcaProduseComparate();
    actualizeazaStareaButoanelor();
});
