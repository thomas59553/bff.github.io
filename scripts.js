document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
    const searchInput = document.getElementById('search-input');
    const clientFilter = document.getElementById('client-filter');
    const productDetail = document.getElementById('product-detail');
    const breadcrumb = document.getElementById('breadcrumb');
    const searchContainer = document.querySelector('.search-container'); // Assurez-vous d'avoir une classe search-container pour le conteneur de recherche et filtre

    // Déclarer products en dehors de loadData pour la rendre globale
    let products = [];

    // Fonction pour charger les données JSON
    const loadData = async () => {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            products = await response.json(); // Initialiser products
            displayProducts(products);

            // Remplir le filtre de clients
            const clients = [...new Set(products.map(product => product['Nom Client']))];
            clients.forEach(client => {
                const option = document.createElement('option');
                option.value = client;
                option.textContent = client;
                clientFilter.appendChild(option);
            });

            // Événements pour la recherche et le filtrage
            searchInput.addEventListener('input', () => filterAndSearchProducts(products));
            clientFilter.addEventListener('change', () => filterAndSearchProducts(products));
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        }
    };

    // Fonction pour afficher les produits groupés par client
    const displayProducts = (products) => {
        productList.innerHTML = '';

        const groupedProducts = products.reduce((acc, product) => {
            const client = product['Nom Client'];
            if (!acc[client]) {
                acc[client] = [];
            }
            acc[client].push(product);
            return acc;
        }, {});

        Object.keys(groupedProducts).forEach(client => {
            const clientGroup = document.createElement('div');
            clientGroup.className = 'client-group';

            const clientName = document.createElement('h2');
            clientName.className = 'client-name';
            clientName.textContent = client;
            clientGroup.appendChild(clientName);

            const row = document.createElement('div');
            row.className = 'row';

            groupedProducts[client].forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'col-md-4 mb-4';
                productCard.innerHTML = `
                    <div class="card h-100 product-card" data-product='${JSON.stringify(product)}'>
                        <img src="${product['URL Photo']}" class="card-img-top" alt="${product['Nom Produit']}">
                        <div class="card-body">
                            <h5 class="card-title">${product['Nom Produit']}</h5>
                            <p class="card-text"><strong>Client:</strong> ${product['Nom Client']}</p>
                            <p class="card-text"><strong>Poids:</strong> ${product['Qté Par Boite']}</p>
                        </div>
                    </div>
                `;
                productCard.addEventListener('click', () => showProductDetails(product));
                row.appendChild(productCard);
            });

            clientGroup.appendChild(row);
            productList.appendChild(clientGroup);
        });
    };

    // Filtrage et recherche des produits
    const filterAndSearchProducts = (products) => {
        const searchText = searchInput.value.toLowerCase();
        const selectedClient = clientFilter.value;
        const filteredProducts = products.filter(product => {
            const productName = product['Nom Produit'] ? product['Nom Produit'].toLowerCase() : '';
            const clientName = product['Nom Client'] || '';
            return (productName.includes(searchText) &&
                (selectedClient === '' || clientName === selectedClient));
        });
        displayProducts(filteredProducts);
    };

    // Afficher les détails du produit
    const showProductDetails = (product) => {
        productList.style.display = 'none';
        productDetail.style.display = 'block';
        searchContainer.style.display = 'none'; // Cacher la recherche et le filtre

        // Détails du produit
        document.getElementById('detail-img').src = product['URL Photo'];
        document.getElementById('detail-img').alt = product['Nom Produit'];
        document.getElementById('detail-title').textContent = product['Nom Produit'];
        document.getElementById('detail-client').textContent = product['Nom Client'];
        document.getElementById('detail-version').textContent = product['Version'];
        document.getElementById('detail-modele-boite').textContent = product['Modèle Boite'];
        document.getElementById('detail-quantite-boite').textContent = product['Qté Par Boite'];
        document.getElementById('detail-modele-carton').textContent = product['Modèle Carton'];
        document.getElementById('detail-quantite-carton').textContent = product['Qté par carton'];
        document.getElementById('detail-duree-ddm').textContent = product['Durée DDM'];
        document.getElementById('detail-ddm').textContent = product['DDM'];
        document.getElementById('detail-fiche').href = product['Fiche Pdf'];

        // Mise à jour des breadcrumbs
        const breadcrumbProduct = document.createElement('li');
        breadcrumbProduct.className = 'breadcrumb-item active';
        breadcrumbProduct.setAttribute('aria-current', 'page');
        breadcrumbProduct.textContent = product['Nom Produit'];
        breadcrumb.appendChild(breadcrumbProduct);
    };

    // Retour à la liste des produits
    const returnToProductList = () => {
        productList.style.display = 'block';
        productDetail.style.display = 'none';
        searchContainer.style.display = 'block'; // Réafficher la recherche et le filtre
        const lastBreadcrumb = breadcrumb.lastChild;
        if (lastBreadcrumb && lastBreadcrumb.textContent !== 'Conditionnement') {
            breadcrumb.removeChild(lastBreadcrumb);
        }
        filterAndSearchProducts(products);  // Mettre à jour l'affichage avec les filtres et la recherche actifs
    };

    document.getElementById('breadcrumb-home').addEventListener('click', (e) => {
        e.preventDefault();
        returnToProductList();
    });

    // Charger les données au démarrage
    loadData();
});
