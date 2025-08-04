
(function() {
  const { useState, useEffect } = React;
  const { motion, AnimatePresence } = window.FramerMotion || {
    motion: { div: "div", h1: "h1", li: "li", button: "button" },
    AnimatePresence: ({ children }) => children
  };

  function App() {
    const [currentRole, setCurrentRole] = useState("employee");
    const [orders, setOrders] = useState([]);
    const [designs, setDesigns] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [shareCode, setShareCode] = useState("");
    const [viewedCard, setViewedCard] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    
    // Company form states
    const [companyName, setCompanyName] = useState("");
    const [brandColors, setBrandColors] = useState("");
    const [logo, setLogo] = useState("");
    
    // Designer form states
    const [selectedOrder, setSelectedOrder] = useState("");
    const [designTemplate, setDesignTemplate] = useState("");
    
    // HR form states
    const [selectedDesign, setSelectedDesign] = useState("");
    const [employeeName, setEmployeeName] = useState("");
    const [employeeTitle, setEmployeeTitle] = useState("");
    const [employeeEmail, setEmployeeEmail] = useState("");
    const [employeePhone, setEmployeePhone] = useState("");

    // Load data from localStorage
    useEffect(() => {
      setOrders(JSON.parse(localStorage.getItem("orders")) || []);
      setDesigns(JSON.parse(localStorage.getItem("designs")) || []);
      setEmployees(JSON.parse(localStorage.getItem("employees")) || []);
      
      const savedDarkMode = localStorage.getItem("darkMode") === "true";
      setDarkMode(savedDarkMode);
      if (savedDarkMode) {
        document.body.classList.add("dark");
      }
    }, []);

    // Save data to localStorage
    useEffect(() => {
      localStorage.setItem("orders", JSON.stringify(orders));
      localStorage.setItem("designs", JSON.stringify(designs));
      localStorage.setItem("employees", JSON.stringify(employees));
    }, [orders, designs, employees]);

    const toggleDarkMode = () => {
      const newDarkMode = !darkMode;
      setDarkMode(newDarkMode);
      localStorage.setItem("darkMode", newDarkMode);
      document.body.classList.toggle("dark", newDarkMode);
    };

    const generateShareCode = () => {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
    };

    const handleCompanySubmit = () => {
      if (!companyName || !brandColors) return;
      
      const newOrder = {
        id: Date.now(),
        companyName,
        brandColors,
        logo,
        status: "pending",
        createdAt: new Date().toLocaleDateString()
      };
      
      setOrders([...orders, newOrder]);
      setCompanyName("");
      setBrandColors("");
      setLogo("");
      alert("Order placed successfully!");
    };

    const handleDesignSubmit = () => {
      if (!selectedOrder || !designTemplate) return;
      
      const newDesign = {
        id: Date.now(),
        orderId: parseInt(selectedOrder),
        template: designTemplate,
        createdAt: new Date().toLocaleDateString()
      };
      
      setDesigns([...designs, newDesign]);
      
      // Update order status
      setOrders(orders.map(order => 
        order.id === parseInt(selectedOrder) 
          ? { ...order, status: "designed" }
          : order
      ));
      
      setSelectedOrder("");
      setDesignTemplate("");
      alert("Design created successfully!");
    };

    const handleHRSubmit = () => {
      if (!selectedDesign || !employeeName || !employeeTitle || !employeeEmail) return;
      
      const design = designs.find(d => d.id === parseInt(selectedDesign));
      const order = orders.find(o => o.id === design.orderId);
      
      const newEmployee = {
        id: Date.now(),
        name: employeeName,
        title: employeeTitle,
        email: employeeEmail,
        phone: employeePhone,
        designId: parseInt(selectedDesign),
        companyName: order.companyName,
        brandColors: order.brandColors,
        template: design.template,
        shareCode: generateShareCode(),
        createdAt: new Date().toLocaleDateString()
      };
      
      setEmployees([...employees, newEmployee]);
      setSelectedDesign("");
      setEmployeeName("");
      setEmployeeTitle("");
      setEmployeeEmail("");
      setEmployeePhone("");
      alert("Employee card assigned successfully!");
    };

    const handleShareCodeLookup = () => {
      const card = employees.find(emp => emp.shareCode === shareCode.toUpperCase());
      if (card) {
        setViewedCard(card);
      } else {
        alert("Invalid share code!");
      }
      setShareCode("");
    };

    const renderEmployeeView = () => {
      return React.createElement("div", { className: "glass", style: { maxWidth: "600px", width: "100%" } }, [
        React.createElement("h2", { key: "title" }, "👤 Employee Portal"),
        
        // My Cards Section
        React.createElement("div", { key: "my-cards", style: { marginBottom: "2rem" } }, [
          React.createElement("h3", { key: "my-cards-title" }, "My Business Cards"),
          employees.length === 0 
            ? React.createElement("p", { key: "no-cards" }, "No cards assigned yet. Contact HR to get your business card.")
            : employees.map(employee => 
                React.createElement("div", {
                  key: employee.id,
                  className: "glass",
                  style: { 
                    margin: "1rem 0", 
                    padding: "1rem",
                    background: `linear-gradient(135deg, ${employee.brandColors || '#6366f1, #9333ea'})`
                  }
                }, [
                  React.createElement("h4", { key: "name", style: { color: "white", margin: "0 0 0.5rem 0" } }, employee.name),
                  React.createElement("p", { key: "title", style: { color: "white", margin: "0 0 0.5rem 0" } }, employee.title),
                  React.createElement("p", { key: "company", style: { color: "white", margin: "0 0 0.5rem 0" } }, employee.companyName),
                  React.createElement("p", { key: "email", style: { color: "white", margin: "0 0 0.5rem 0" } }, employee.email),
                  employee.phone && React.createElement("p", { key: "phone", style: { color: "white", margin: "0 0 1rem 0" } }, employee.phone),
                  React.createElement("div", { key: "share-info", style: { borderTop: "1px solid rgba(255,255,255,0.3)", paddingTop: "1rem" } }, [
                    React.createElement("p", { key: "share-text", style: { color: "white", margin: "0 0 0.5rem 0", fontSize: "0.9rem" } }, "Share Code:"),
                    React.createElement("code", { key: "share-code", style: { color: "white", background: "rgba(255,255,255,0.2)", padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "1.1rem", fontWeight: "bold" } }, employee.shareCode)
                  ])
                ])
              )
        ]),
        
        // Receive Card Section
        React.createElement("div", { key: "receive-card", style: { borderTop: "1px solid #e5e7eb", paddingTop: "2rem" } }, [
          React.createElement("h3", { key: "receive-title" }, "Receive Someone's Card"),
          React.createElement("p", { key: "receive-description", style: { color: "#6b7280", marginBottom: "1rem" } }, "Enter a share code to view someone's business card:"),
          React.createElement("input", {
            key: "share-input",
            type: "text",
            placeholder: "Enter share code (e.g., ABC123XY)",
            value: shareCode,
            onChange: (e) => setShareCode(e.target.value.toUpperCase()),
            style: { textTransform: "uppercase" }
          }),
          React.createElement("button", {
            key: "lookup-btn",
            className: "gradient-btn",
            onClick: handleShareCodeLookup,
            disabled: !shareCode.trim()
          }, "View Card")
        ]),
        
        // Viewed Card Display
        viewedCard && React.createElement("div", {
          key: "viewed-card",
          className: "glass",
          style: { 
            margin: "2rem 0 0 0", 
            padding: "1.5rem",
            background: `linear-gradient(135deg, ${viewedCard.brandColors || '#6366f1, #9333ea'})`
          }
        }, [
          React.createElement("h4", { key: "viewed-title", style: { color: "white", margin: "0 0 1rem 0" } }, "📇 Received Business Card"),
          React.createElement("h3", { key: "viewed-name", style: { color: "white", margin: "0 0 0.5rem 0" } }, viewedCard.name),
          React.createElement("p", { key: "viewed-jobtitle", style: { color: "white", margin: "0 0 0.5rem 0" } }, viewedCard.title),
          React.createElement("p", { key: "viewed-company", style: { color: "white", margin: "0 0 0.5rem 0" } }, viewedCard.companyName),
          React.createElement("p", { key: "viewed-email", style: { color: "white", margin: "0 0 0.5rem 0" } }, viewedCard.email),
          viewedCard.phone && React.createElement("p", { key: "viewed-phone", style: { color: "white", margin: "0" } }, viewedCard.phone),
          React.createElement("button", {
            key: "close-btn",
            onClick: () => setViewedCard(null),
            style: { 
              marginTop: "1rem", 
              background: "rgba(255,255,255,0.2)", 
              color: "white", 
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              cursor: "pointer"
            }
          }, "Close")
        ])
      ]);
    };

    const renderCompanyView = () => {
      return React.createElement("div", { className: "glass", style: { maxWidth: "500px", width: "100%" } }, [
        React.createElement("h2", { key: "title" }, "🏢 Company Portal"),
        React.createElement("p", { key: "description" }, "Place an order for business card designs"),
        React.createElement("input", {
          key: "company-name",
          type: "text",
          placeholder: "Company Name",
          value: companyName,
          onChange: (e) => setCompanyName(e.target.value)
        }),
        React.createElement("input", {
          key: "brand-colors",
          type: "text",
          placeholder: "Brand Colors (e.g., #4f46e5, #9333ea)",
          value: brandColors,
          onChange: (e) => setBrandColors(e.target.value)
        }),
        React.createElement("input", {
          key: "logo",
          type: "text",
          placeholder: "Logo URL (optional)",
          value: logo,
          onChange: (e) => setLogo(e.target.value)
        }),
        React.createElement("button", {
          key: "submit",
          className: "gradient-btn",
          onClick: handleCompanySubmit,
          disabled: !companyName || !brandColors
        }, "Place Order"),
        
        // Orders List
        React.createElement("div", { key: "orders-list", style: { marginTop: "2rem" } }, [
          React.createElement("h3", { key: "orders-title" }, "My Orders"),
          orders.length === 0 
            ? React.createElement("p", { key: "no-orders" }, "No orders placed yet.")
            : orders.map(order => 
                React.createElement("div", {
                  key: order.id,
                  style: { 
                    background: "#f3f4f6", 
                    padding: "1rem", 
                    margin: "0.5rem 0", 
                    borderRadius: "0.5rem",
                    border: `2px solid ${order.status === 'pending' ? '#fbbf24' : '#10b981'}`
                  }
                }, [
                  React.createElement("strong", { key: "company" }, order.companyName),
                  React.createElement("span", { 
                    key: "status",
                    style: { 
                      float: "right", 
                      background: order.status === 'pending' ? '#fbbf24' : '#10b981',
                      color: "white",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.8rem"
                    }
                  }, order.status.toUpperCase())
                ])
              )
        ])
      ]);
    };

    const renderDesignerView = () => {
      const pendingOrders = orders.filter(order => order.status === "pending");
      
      return React.createElement("div", { className: "glass", style: { maxWidth: "500px", width: "100%" } }, [
        React.createElement("h2", { key: "title" }, "🎨 Designer Portal"),
        React.createElement("p", { key: "description" }, "Create designs for pending orders"),
        
        pendingOrders.length === 0 
          ? React.createElement("p", { key: "no-pending" }, "No pending orders to design.")
          : [
              React.createElement("select", {
                key: "order-select",
                value: selectedOrder,
                onChange: (e) => setSelectedOrder(e.target.value)
              }, [
                React.createElement("option", { key: "default", value: "" }, "Select an order"),
                ...pendingOrders.map(order => 
                  React.createElement("option", { key: order.id, value: order.id }, 
                    `${order.companyName} - ${order.createdAt}`
                  )
                )
              ]),
              
              selectedOrder && React.createElement("div", { key: "order-details", style: { background: "#f3f4f6", padding: "1rem", borderRadius: "0.5rem", margin: "1rem 0" } }, [
                React.createElement("h4", { key: "details-title" }, "Order Details"),
                React.createElement("p", { key: "company" }, `Company: ${orders.find(o => o.id === parseInt(selectedOrder))?.companyName}`),
                React.createElement("p", { key: "colors" }, `Brand Colors: ${orders.find(o => o.id === parseInt(selectedOrder))?.brandColors}`)
              ]),
              
              React.createElement("textarea", {
                key: "template",
                placeholder: "Enter design template details...",
                value: designTemplate,
                onChange: (e) => setDesignTemplate(e.target.value),
                rows: 4
              }),
              
              React.createElement("button", {
                key: "submit",
                className: "gradient-btn",
                onClick: handleDesignSubmit,
                disabled: !selectedOrder || !designTemplate
              }, "Submit Design")
            ]
      ]);
    };

    const renderHRView = () => {
      const availableDesigns = designs.map(design => ({
        ...design,
        order: orders.find(order => order.id === design.orderId)
      }));
      
      return React.createElement("div", { className: "glass", style: { maxWidth: "500px", width: "100%" } }, [
        React.createElement("h2", { key: "title" }, "👥 HR Portal"),
        React.createElement("p", { key: "description" }, "Assign business cards to employees"),
        
        availableDesigns.length === 0 
          ? React.createElement("p", { key: "no-designs" }, "No designs available yet.")
          : [
              React.createElement("select", {
                key: "design-select",
                value: selectedDesign,
                onChange: (e) => setSelectedDesign(e.target.value)
              }, [
                React.createElement("option", { key: "default", value: "" }, "Select a design"),
                ...availableDesigns.map(design => 
                  React.createElement("option", { key: design.id, value: design.id }, 
                    `${design.order.companyName} - ${design.createdAt}`
                  )
                )
              ]),
              
              React.createElement("input", {
                key: "emp-name",
                type: "text",
                placeholder: "Employee Name",
                value: employeeName,
                onChange: (e) => setEmployeeName(e.target.value)
              }),
              
              React.createElement("input", {
                key: "emp-title",
                type: "text",
                placeholder: "Job Title",
                value: employeeTitle,
                onChange: (e) => setEmployeeTitle(e.target.value)
              }),
              
              React.createElement("input", {
                key: "emp-email",
                type: "email",
                placeholder: "Email Address",
                value: employeeEmail,
                onChange: (e) => setEmployeeEmail(e.target.value)
              }),
              
              React.createElement("input", {
                key: "emp-phone",
                type: "tel",
                placeholder: "Phone Number (optional)",
                value: employeePhone,
                onChange: (e) => setEmployeePhone(e.target.value)
              }),
              
              React.createElement("button", {
                key: "submit",
                className: "gradient-btn",
                onClick: handleHRSubmit,
                disabled: !selectedDesign || !employeeName || !employeeTitle || !employeeEmail
              }, "Assign Card to Employee")
            ]
      ]);
    };

    return React.createElement("div", { className: "container" }, [
      React.createElement("button", {
        key: "theme-toggle",
        onClick: toggleDarkMode,
        className: "gradient-btn",
        style: { width: "auto", padding: "0.5rem 1rem", marginBottom: "1rem" }
      }, darkMode ? "☀️ Light" : "🌙 Dark"),
      
      React.createElement("h1", { key: "main-title" }, "Business Card Studio"),
      
      React.createElement("div", {
        key: "role-selector",
        className: "glass",
        style: { maxWidth: "500px", width: "100%", marginBottom: "2rem" }
      }, [
        React.createElement("label", { key: "role-label" }, "Select Role"),
        React.createElement("select", {
          key: "role-select",
          value: currentRole,
          onChange: (e) => setCurrentRole(e.target.value)
        }, [
          React.createElement("option", { key: "company", value: "company" }, "🏢 Company"),
          React.createElement("option", { key: "designer", value: "designer" }, "🎨 Designer"),
          React.createElement("option", { key: "hr", value: "hr" }, "👥 HR"),
          React.createElement("option", { key: "employee", value: "employee" }, "👤 Employee")
        ])
      ]),
      
      currentRole === "company" && renderCompanyView(),
      currentRole === "designer" && renderDesignerView(),
      currentRole === "hr" && renderHRView(),
      currentRole === "employee" && renderEmployeeView()
    ]);
  }

  ReactDOM.render(React.createElement(App), document.getElementById("root"));

  // Register service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
  }
})();
