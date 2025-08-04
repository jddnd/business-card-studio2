(function () {
  const { useState, useEffect } = React;
  const { motion, AnimatePresence } = window.FramerMotion || {
    motion: { div: 'div', h1: 'h1', li: 'li', button: 'button' },
    AnimatePresence: ({ children }) => children
  };

  function App() {
    const [role, setRole] = useState('company');
    const [orders, setOrders] = useState([]);
    const [designs, setDesigns] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [companyName, setCompanyName] = useState('');
    const [brandDetails, setBrandDetails] = useState('');
    const [designTemplate, setDesignTemplate] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [employeeEmail, setEmployeeEmail] = useState('');
    const [employeePhone, setEmployeePhone] = useState('');
    const [employeeTitle, setEmployeeTitle] = useState('');
    const [assignCode, setAssignCode] = useState('');
    const [receiveCode, setReceiveCode] = useState('');
    const [darkMode, setDarkMode] = useState(false);

    // Load from localStorage
    useEffect(() => {
      setOrders(JSON.parse(localStorage.getItem('orders')) || []);
      setDesigns(JSON.parse(localStorage.getItem('designs')) || []);
      setEmployees(JSON.parse(localStorage.getItem('employees')) || []);
      const theme = localStorage.getItem('darkMode') === 'true';
      setDarkMode(theme);
      if (theme) document.body.classList.add('dark');
    }, []);

    useEffect(() => {
      localStorage.setItem('orders', JSON.stringify(orders));
      localStorage.setItem('designs', JSON.stringify(designs));
      localStorage.setItem('employees', JSON.stringify(employees));
    }, [orders, designs, employees]);

    const toggleDarkMode = () => {
      const newMode = !darkMode;
      setDarkMode(newMode);
      localStorage.setItem('darkMode', newMode);
      document.body.classList.toggle('dark', newMode);
    };

    const placeOrder = () => {
      if (!companyName || !brandDetails) return alert('Please fill in all fields');
      setOrders([...orders, { id: Date.now(), companyName, brandDetails, status: 'Pending' }]);
      setCompanyName(''); setBrandDetails('');
    };

    const submitDesign = (orderId) => {
      if (!designTemplate) return alert('Please enter a design template');
      setDesigns([...designs, {
        id: Date.now(), orderId, template: designTemplate,
        shareCode: Math.random().toString(36).substr(2, 8).toUpperCase()
      }]);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Designed' } : o));
      setDesignTemplate('');
    };

    const assignCard = (designId) => {
      if (!employeeName || !employeeEmail || !employeePhone || !employeeTitle)
        return alert('Please fill in all employee details');
      const design = designs.find(d => d.id === designId);
      setEmployees([...employees, {
        id: Date.now(), name: employeeName, email: employeeEmail,
        phone: employeePhone, title: employeeTitle, template: design.template,
        shareCode: Math.random().toString(36).substr(2, 8).toUpperCase()
      }]);
      setEmployeeName(''); setEmployeeEmail(''); setEmployeePhone(''); setEmployeeTitle('');
    };

    const shareCard = (employee) => setAssignCode(employee.shareCode);
    const receiveCard = () => {
      const employee = employees.find(e => e.shareCode === receiveCode);
      alert(employee
        ? `Card: ${employee.name}, ${employee.title}, ${employee.email}, ${employee.phone}`
        : 'Invalid share code');
      setReceiveCode('');
    };

    const inputClass = '';
    const buttonClass = 'gradient-btn';

    return React.createElement('div', { className: 'container' }, [
      React.createElement('button', { onClick: toggleDarkMode, className: 'gradient-btn', style: { width: 'auto', padding: '0.5rem 1rem', marginBottom: '1rem' } }, darkMode ? '☀ Light' : '🌙 Dark'),
      React.createElement('h1', null, 'Business Card Studio'),
      React.createElement('div', { className: 'glass', style: { maxWidth: '500px', width: '100%', marginBottom: '2rem' } }, [
        React.createElement('label', null, 'Select Role'),
        React.createElement('select', { value: role, onChange: e => setRole(e.target.value) }, [
          React.createElement('option', { value: 'company' }, 'Company'),
          React.createElement('option', { value: 'designer' }, 'Designer'),
          React.createElement('option', { value: 'hr' }, 'HR'),
          React.createElement('option', { value: 'employee' }, 'Employee')
        ])
      ]),
      React.createElement('div', { className: 'glass', style: { maxWidth: '500px', width: '100%', marginBottom: '2rem' } },
        role === 'company'
          ? [
            React.createElement('input', { placeholder: 'Company Name', value: companyName, onChange: e => setCompanyName(e.target.value) }),
            React.createElement('textarea', { placeholder: 'Brand Details', value: brandDetails, onChange: e => setBrandDetails(e.target.value) }),
            React.createElement('button', { onClick: placeOrder, className: buttonClass }, 'Place Order')
          ]
          : role === 'designer'
            ? [
              orders.length === 0 ? React.createElement('p', null, 'No orders yet') :
              orders.map(o => React.createElement('div', { key: o.id, style: { marginBottom: '1rem' } }, [
                React.createElement('p', null, `${o.companyName} - ${o.status}`),
                o.status === 'Pending' && React.createElement('div', null, [
                  React.createElement('textarea', { placeholder: 'Design Template', value: designTemplate, onChange: e => setDesignTemplate(e.target.value) }),
                  React.createElement('button', { onClick: () => submitDesign(o.id), className: buttonClass }, 'Submit Design')
                ])
              ]))
            ]
            : role === 'hr'
              ? [
                designs.length === 0 ? React.createElement('p', null, 'No designs yet') :
                [
                  React.createElement('input', { placeholder: 'Employee Name', value: employeeName, onChange: e => setEmployeeName(e.target.value) }),
                  React.createElement('input', { placeholder: 'Job Title', value: employeeTitle, onChange: e => setEmployeeTitle(e.target.value) }),
                  React.createElement('input', { placeholder: 'Email', value: employeeEmail, onChange: e => setEmployeeEmail(e.target.value) }),
                  React.createElement('input', { placeholder: 'Phone', value: employeePhone, onChange: e => setEmployeePhone(e.target.value) }),
                  designs.map(d => React.createElement('div', { key: d.id }, [
                    React.createElement('p', null, `Template: ${d.template}`),
                    React.createElement('button', { onClick: () => assignCard(d.id), className: buttonClass }, 'Assign Card')
                  ]))
                ]
              ]
              : [
                employees.length === 0 ? React.createElement('p', null, 'No cards assigned') :
                employees.map(e => React.createElement('div', { key: e.id }, [
                  React.createElement('p', null, `${e.name} - ${e.title}`),
                  React.createElement('button', { onClick: () => shareCard(e), className: buttonClass }, 'Share Card')
                ])),
                assignCode && React.createElement('p', null, `Share Code: ${assignCode}`)
              ]
      ),
      React.createElement('div', { className: 'glass', style: { maxWidth: '500px', width: '100%' } }, [
        React.createElement('h3', null, 'Receive a Card'),
        React.createElement('input', { placeholder: 'Enter share code', value: receiveCode, onChange: e => setReceiveCode(e.target.value) }),
        React.createElement('button', { onClick: receiveCard, className: buttonClass }, 'Receive Card')
      ])
    ]);
  }

  ReactDOM.render(React.createElement(App), document.getElementById('root'));
})();
