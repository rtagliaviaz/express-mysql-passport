const express = require('express');
const pool = require('../database')
const {isLoggedIn, isNotLoggedIn, isAdmin} = require('../lib/auth');
const upload = require('../lib/upload');
const router = express.Router();

/*
  CLIENTS
    -datos
    -balance
    -ingresos
    -gastos
*/

//datos cliente
router.get('/datos', isLoggedIn, async(req, res) => {
  const userData = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id])
  res.render('clients/datos/datos', {userData})
})
//edit
router.get('/datos/edit', isLoggedIn, async(req, res) => { 
  console.log('user info', req.user)
  const userData = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id])
  console.log(userData)
  res.render('clients/datos/edit', {userData});
});

router.post('/datos/edit', isLoggedIn, upload.single('image'), async(req, res) => {
  const userId = req.user.id
  const {firstname, lastname, bday, bmonth, byear} = req.body;
  if (!req.file) {
    const updatedData = {
      firstname,
      lastname,
      bday,
      bmonth,
      byear
    }
    await pool.query('UPDATE users set ? WHERE id = ?', [updatedData, userId])
  } else {
    console.log(req.file)
    const image = req.file.originalname
    const updatedData = {
      firstname,
      lastname,
      bday,
      bmonth,
      byear,
      image
    }
    await pool.query('UPDATE users set ? WHERE id = ?', [updatedData, userId])
  }
  res.redirect('/profile');
})

/*
  categorias personales
  -add
  -edit
  -delete
*/
router.get('/categorias', isLoggedIn, async (req, res) => {
  const generalCats = await pool.query('SELECT * FROM general_categories')
  const personalCats = await pool.query('SELECT * FROM personal_categories WHERE user_id = ?', [req.user.id])
  res.render('clients/categorias/list', {personalCats, generalCats})
})

router.get('/categorias/add', isLoggedIn, (req, res) => {
  res.render('clients/categorias/add')
})

router.post('/categorias/add', isLoggedIn, async (req, res) => {
  const {title} = req.body;
  const newPersonalCat = {
    title,
    user_id: req.user.id
  }
  await pool.query('INSERT INTO personal_categories SET ?', [newPersonalCat])
  req.flash('success', 'Successfully Added')
  res.redirect('/categorias')
})

router.get('/categorias/delete/:id', isLoggedIn, async (req, res) => {
  const {id} = req.params; //category id
  await pool.query('DELETE FROM personal_categories WHERE id = ?', [id]);
  req.flash('success', 'Category deleted successfully');
  res.redirect('/categorias')
});

router.get('/categorias/edit/:id', isLoggedIn, async(req, res) => { 
  const {id} = req.params; //category id
  const catInfo = await pool.query('SELECT * FROM personal_categories WHERE id = ?', [id])
  res.render('clients/categorias/edit', {catInfo});
});

router.post('/categorias/edit/:id', isLoggedIn, async(req, res) => {
  const {id} = req.params;
  const {title} = req.body;
  const newCatInfo = {
    title
  }
  await pool.query('UPDATE personal_categories set ? WHERE id = ?', [newCatInfo, id])
  req.flash('success', 'category successfully edited')
  res.redirect('/categorias')
})

//balance
/**
 * obtener el total amount de income y de outcome y luego realizar la resta para obtener el balnce
 * pasar el resultado a la vista
 */
router.get('/balance', isLoggedIn, async(req, res) => {
  const user_id = req.user.id;
  const totalInc = await pool.query('SELECT SUM(amount) FROM income WHERE user_id', [user_id])
  const totalOut = await pool.query('SELECT SUM(amount) FROM outcome WHERE user_id', [user_id])
  const inc = (totalInc[0][Object.keys(totalInc[0])[0]]) //obtiene el valor del objeto SUM(amount) que no podemos acceder
  const out = (totalOut[0][Object.keys(totalOut[0])[0]]) //obtiene el valor del objeto SUM(amount) que no podemos acceder
  const balance = inc - out
  console.log(balance)
  res.render('clients/balance', {balance})
});

//ingresos
router.get('/ingresos', isLoggedIn, async(req, res) => {
  const user_id = req.user.id;
  const income = await pool.query('SELECT * FROM income WHERE user_id = ?', [user_id])

  // const income = await pool.query('SELECT * FROM income WHERE YEAR(created_at)= ?', [year])

  res.render('clients/ingresos/ingresos', {income})
})

router.get('/ingresos/add', isLoggedIn, async(req, res) => {
  const user_id = req.user.id
  const general = await pool.query('SELECT * FROM general_categories')
  const currency = await pool.query('SELECT * FROM currency')
  console.log(general)
  const personal = await pool.query('SELECT * FROM personal_categories WHERE user_id = ?', [user_id])
  res.render('clients/ingresos/add', {general, personal})
})

router.post('/ingresos/add', isLoggedIn, async(req, res) => {
  const {title, category, description, currency, amount} = req.body;
  console.log(req.body)
  const newRegister = {
    title,
    category,
    description,
    currency,
    amount,
    user_id: req.user.id
  }
  await pool.query('INSERT INTO income set ?', [newRegister])
  req.flash('success', 'Income Registered Successfully.')
  res.redirect('/ingresos')
})

router.get('/ingresos/delete/:id', isLoggedIn, async (req, res) => {
  const {id} = req.params; //register id
  await pool.query('DELETE FROM income WHERE id = ?', [id]);
  req.flash('success', 'Register deleted successfully');
  res.redirect('/ingresos')
});

router.get('/ingresos/edit/:id', isLoggedIn, async(req, res) => {
  const user_id = req.user.id
  const {id} = req.params; //outcome register id
  const info = await pool.query('SELECT * FROM income WHERE id = ?', [id])
  const general = await pool.query('SELECT * FROM general_categories') //obtener categorias generales
  const personal = await pool.query('SELECT * FROM personal_categories WHERE user_id = ?', [user_id]) //obtener cat personales
  const currency = await pool.query('SELECT * FROM currency')
  console.log(general)
  res.render('clients/ingresos/edit', {info, general, personal, currency});
})

router.post('/ingresos/edit/:id', isLoggedIn, async(req, res) => {
  const {title, category, description, currency, amount} = req.body;
  const {id} = req.params;
  console.log(req.body)
  const editedRegister = {
    title,
    category,
    description,
    currency,
    amount,
    id
  }
  await pool.query('UPDATE income set ? WHERE id = ?', [editedRegister, id])
  req.flash('success', 'register successfully edited')
  res.redirect('/ingresos')
})

//gastos
router.get('/gastos', isLoggedIn, async(req, res) => {
  const user_id = req.user.id;
  const outcome = await pool.query('SELECT * FROM outcome WHERE user_id = ?', [user_id])

  // const income = await pool.query('SELECT * FROM income WHERE YEAR(created_at)= ?', [year])

  res.render('clients/gastos/gastos', {outcome})
})

router.get('/gastos/add', isLoggedIn, async (req, res) => {
  const user_id = req.user.id
  const general = await pool.query('SELECT * FROM general_categories')
  console.log(general)
  const personal = await pool.query('SELECT * FROM personal_categories WHERE user_id = ?', [user_id])
  const currency = await pool.query('SELECT * FROM currency')
  res.render('clients/gastos/add', {general, personal, currency})
})

router.post('/gastos/add', isLoggedIn, async(req, res) => {
  const {title, category, description, currency, amount} = req.body;
  console.log(req.body)
  const newRegister = {
    title,
    category,
    description,
    currency,
    amount,
    user_id: req.user.id
  }
  await pool.query('INSERT INTO outcome set ?', [newRegister])
  req.flash('success', 'Outcome Registered Successfully.')
  res.redirect('/gastos')
})

router.get('/gastos/delete/:id', isLoggedIn, async (req, res) => {
  const {id} = req.params; //register id
  await pool.query('DELETE FROM outcome WHERE id = ?', [id]);
  req.flash('success', 'Register deleted successfully');
  res.redirect('/gastos')
});

router.get('/gastos/edit/:id', isLoggedIn, async(req, res) => {
  const user_id = req.user.id
  const {id} = req.params; //outcome register id
  const info = await pool.query('SELECT * FROM outcome WHERE id = ?', [id])
  const general = await pool.query('SELECT * FROM general_categories') //obtener categorias generales
  const personal = await pool.query('SELECT * FROM personal_categories WHERE user_id = ?', [user_id]) //obtener cat personales
  const currency = await pool.query('SELECT * FROM currency')
  res.render('clients/gastos/edit', {info, general, personal, currency});
})

router.post('/gastos/edit/:id', isLoggedIn, async(req, res) => {
  const {title, category, description, currency, amount} = req.body;
  const {id} = req.params;
  console.log(req.body)
  const editedRegister = {
    title,
    category,
    description,
    currency,
    amount,
    id
  }
  await pool.query('UPDATE outcome set ? WHERE id = ?', [editedRegister, id])
  req.flash('success', 'register successfully edited')
  res.redirect('/gastos')
})

//reportes
router.get('/reportes', isLoggedIn, (req, res) => {
  res.render('clients/reportes/reportes')
})

//gastos diarios por mes
router.get('/reportes/month', isLoggedIn, async (req, res) => {
  res.render('clients/reportes/month-select')
})

router.get('/reportes/dpm', isLoggedIn, async(req, res) => {
  const respuesta = await pool.query('CALL for_dayss()') //obtain results from the procedure query
  let respuestaToJson = {
    days: JSON.stringify(respuesta) //transform results from the query into JSON
    //https://stackoverflow.com/questions/51710708/after-passing-object-to-handlebars-how-can-i-access-that-object-in-script-tag
  }
  res.render('clients/reportes/dpm', respuestaToJson) //pass json results to handlebars file
})

router.post('/reportes/dpm', isLoggedIn, async(req, res) => {
  
  const {month} = req.body //obtener el mes del form
  const user_id = req.user.id // user_id
  await pool.query('DROP PROCEDURE IF EXISTS for_dayss') //borrar procedure en caso de que exista
  /**
   * crea el procedure, se le asigna un nombre, se declaran las variables para los condicionales,
   * y = mes seleccionado, se hace el query para que selccione el monto total y se le asigna a una columna al igual que el dia y el mes, se comapra con el mes seleccionado, dia y user_id
   */ 
  await pool.query(`
  CREATE PROCEDURE for_dayss()
BEGIN
  DECLARE x INT;
  DECLARE y INT;
  SET x = 1;
  SET y = ${month};
        
	loop_label:  LOOP
    IF y > ${month} THEN 
      
      
      LEAVE loop_label;
    IF  x > 31 THEN 
 
      LEAVE loop_label;
		END IF;
    END IF;
      
    SELECT SUM(amount) as total_outcome, DAY(created_at) as day, MONTH(created_at) as month FROM outcome WHERE DAY(created_at) = x AND MONTH(created_at) = y AND user_id = ?;
    SET  x = x + 1;	
    IF x > 30 THEN
      SET y = y + 1;
      SET x = 1;
    END IF;
    ITERATE  loop_label;   
  END LOOP;
END`, [user_id])
  res.redirect('/reportes/dpm')
})


// router.get('/reportes/dpm', isLoggedIn, async(req, res) => {
//   res.render('clients/reportes/dpm')
// })

/*
  ADMINS
  --dashboard
    -monedas (crud)
    -categorias globales (crud)
    -clientes 
 */
//dashboard
router.get('/admin/dashboard', isAdmin, (req, res) => {
  res.render('admin/dashboard')
})

//monedas / currency
router.get('/admin/currency', isAdmin, async(req, res) => {
  const currency = await pool.query('SELECT * FROM currency')
  console.log(currency)
  res.render('admin/currency/list', {currency})
})

router.get('/admin/currency/add', isAdmin, (req, res) => {
  res.render('admin/currency/add')
})

router.post('/admin/currency/add', isAdmin, async(req, res) => {
  console.log(req.body)
  const {name, code} = req.body
  const newCurrency = {
    name,
    code
  }
  await pool.query('INSERT INTO currency SET ?', [newCurrency])
  res.redirect('/admin/currency')
})

router.get('/admin/currency/delete/:id', isAdmin, async (req, res) => {
  const {id} = req.params; //currency id
  await pool.query('DELETE FROM currency WHERE id = ?', [id]);
  req.flash('success', 'Currency deleted successfully');
  res.redirect('/admin/currency')
});

router.get('/admin/currency/edit/:id', isAdmin, async(req, res) => {
  const {id} = req.params; //currency id
  const currency = await pool.query('SELECT * FROM currency WHERE id = ?', [id])
  res.render('admin/currency/edit', {currency});
})

router.post('/admin/currency/edit/:id', isAdmin, async(req, res) => {
  const {name, code} = req.body;
  const {id} = req.params;
  console.log(req.body)
  const editedCurrency = {
    name,
    code,
    id
  }
  await pool.query('UPDATE currency SET ? WHERE id = ?', [editedCurrency, id])
  req.flash('success', 'currency successfully edited')
  res.redirect('/admin/currency')
})

//categories
router.get('/admin/categories', isAdmin, async(req, res) => {
  const categories = await pool.query('SELECT * FROM general_categories')
  res.render('admin/categories/list', {categories})
})

router.get('/admin/categories/add', isAdmin, (req, res) => {
  res.render('admin/categories/add')
})

router.post('/admin/categories/add', isAdmin, async(req, res) => {
  const {title, type} = req.body;
  const newCategory = {
    title,
    type
  }
  await pool.query('INSERT INTO general_categories SET ?', [newCategory])
  res.redirect('/admin/categories')
})

router.get('/admin/categories/delete/:id', isAdmin, async(req, res) => {
  const {id} = req.params; //currency id
  await pool.query('DELETE FROM general_categories WHERE id = ?', [id]);
  req.flash('success', 'Category deleted successfully');
  res.redirect('/admin/categories')
})

router.get('/admin/categories/edit/:id', isAdmin, async(req, res) => {
  const {id} = req.params; //category id
  const categories = await pool.query('SELECT * FROM general_categories WHERE id = ?', [id])
  res.render('admin/categories/edit', {categories})
})

router.post('/admin/categories/edit/:id', isAdmin, async(req, res) => {
  const {title, type} = req.body;
  const {id} = req.params;
  console.log(req.body)
  const editedCategory = {
    title,
    type,
    id
  }
  await pool.query('UPDATE general_categories SET ? WHERE id = ?', [editedCategory, id])
  req.flash('success', 'category successfully edited')
  res.redirect('/admin/categories')
})


//clients
router.get('/admin/clients', isAdmin, async(req, res) => {
  const clients = await pool.query('SELECT * FROM users');
  res.render('admin/clients', {clients})
})




module.exports = router;

