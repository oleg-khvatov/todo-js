(function() {
  //создаем и возвращаем заголовок приложения------------------------------------------------------------------------------------------------------------------------------------------
  function createAppTitle(title) {
    let appTitle = document.createElement('h2');
    appTitle.innerHTML = title;
    return appTitle;
  }

  //создаем и возвращаем форму для создания дела---------------------------------------------------------------------------------------------------------------------------------------
  function createTodoItemForm() {
    let form = document.createElement('form');
    let input = document.createElement('input');
    let buttonWrapper = document.createElement('div');
    let button = document.createElement('button');

    form.classList.add('input-group', 'mb-3');
    input.classList.add('form-control');
    input.placeholder = 'Введите название нового дела';
    buttonWrapper.classList.add('input-group-append');
    button.classList.add('btn', 'btn-primary');
    button.textContent = 'Добавить дело';
    // button.disabled = 'disabled';
    button.setAttribute('disabled', 'disabled');
    
    buttonWrapper.append(button);
    form.append(input);
    form.append(buttonWrapper);

    input.addEventListener('input', function(){
      if (input.value !== '') {
        button.removeAttribute('disabled') ; //удаление атрибута 'disabled' кнопке "Добавить дело"
      }else {
        button.setAttribute('disabled', 'disabled'); //добавление атрибута 'disabled' кнопке "Добавить дело"
      }
    });
    
    return {
      form,
      input,
      button,
    };
  }

  //создаем и возвращаем список элементов----------------------------------------------------------------------------------------------------------------------------------------------
  function createTodoList() {
    let list = document.createElement('ul');
    list.classList.add('list-group');
    return list;
  }

  //создаем и возвращаем элемент списка <li> с двумя кнопками--------------------------------------------------------------------------------------------------------------------------
  function createTodoItem(name, id) {
    let item = document.createElement('li');
    //кнопки помещаем в элемент, который красиво покажет их в одной группе
    let buttonGroup = document.createElement('div');
    let doneButton = document.createElement('button');
    let deleteButton = document.createElement('button');

    //устанавливаем стили для элемента списка, а также для размещения кнопок
    //в его правой части с помощью flex
    item.textContent = name;
    item.setAttribute('id', id);
    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

    buttonGroup.classList.add('btn-group', 'btn-group-sm');
    doneButton.classList.add('btn', 'btn-success');
    doneButton.textContent = 'Готово';
    deleteButton.classList.add('btn', 'btn-danger');
    deleteButton.textContent = 'Удалить';

    //вкладываем кнопки в отдельный элемент, чтобы они объединились в один блок
    buttonGroup.append(doneButton);
    buttonGroup.append(deleteButton);
    item.append(buttonGroup);

    //приложению нужен доступ к самому элементу и кнопкам, чтобы обрабатывать события нажатия
    return {
      item,
      doneButton,
      deleteButton,
    };
  }//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


  //Функция-обработчик кнопок в элементах списка---------------------------------------------------------------------------------------------------------------------------------------
  function itemButtons(btn, key) {
    btn.doneButton.addEventListener('click', function() {
      btn.item.classList.toggle('list-group-item-success');
      let doneId = parseInt(btn.item.id);
      let dataFromLs = JSON.parse(localStorage.getItem(key));//забираем из localStorage все, что есть
      if (btn.item.classList.contains('list-group-item-success')) {        
        for (object of dataFromLs) {
          if(object.id === doneId) {
            object.done = true;
          };
        };
      }else {
        for (object of dataFromLs) {
          if(object.id === doneId) {
            object.done = false;
          };
        };
      };
      localStorage.setItem(key, JSON.stringify(dataFromLs)); //запись изменений (done), после нажатия кнопки "Готово" 
    });

    btn.deleteButton.addEventListener('click', function() {
      let dataFromLs = JSON.parse(localStorage.getItem(key));//забираем из localStorage все, что есть
      if (confirm('Вы уверены?')) {
        let deleteId = parseInt(btn.item.id); //берем Id удаляемого элемента, переводим в число
        btn.item.remove(); //удаляем с разметки (из html)
        for (let i = 0; i < dataFromLs.length; ++i) {
          if(dataFromLs[i].id === deleteId) {
            dataFromLs.splice(i, 1);
          };
        };
      };
      localStorage.setItem(key, JSON.stringify(dataFromLs)); //запись изменений (done), после нажатия кнопки "Удалить"
    });
  }//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  // функция генерирования случайных чисел---------------------------------------------------------------------------------------------------------------------------------------------
  function randomNumber() {
    let xxx = Math.round(Math.random() * 1000);
    return xxx;
  } //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  //функция создания приложения (самая первая из вызываемых)---------------------------------------------------------------------------------------------------------------------------
  function createTodoApp(container, title = 'Список дел', key, array=[]) {
    let todoAppTitle = createAppTitle(title);
    let todoItemForm = createTodoItemForm();
    let todoList = createTodoList();
    container.append(todoAppTitle);
    container.append(todoItemForm.form); //потому, что функция возвращает объект!!!
    container.append(todoList);
    
    let dataFromLs = JSON.parse(localStorage.getItem(key));//забираем из localStorage все, что есть
 
    // изъятие дел из массива объектов (localStorage)/////////////////////////////////////////////////////////////////////////////////////////////
    if (dataFromLs === null) {
      dataFromLs = array;
      localStorage.setItem(key, JSON.stringify(dataFromLs));
    }
    
    for(object of dataFromLs) {
      object.id = randomNumber(); //добавление свойства Id в дефолтные (ранее созданные) объекты массива dataFromLs
      let defaultItem = createTodoItem(object.name, object.id);
      
      if(object.done) {
        defaultItem.item.classList.add('list-group-item-success');
      }
      
      itemButtons(defaultItem, key);//вызов функции-обработчика кнопок в элементах списка 
      todoList.append(defaultItem.item);//добавляем в список дефолтное дело
    };

    localStorage.setItem(key, JSON.stringify(dataFromLs)); //запись в localStorage массива после присвоения id его элеметам (объектам)

    //браузер создает событие submit на форме по нажатию на Enter или на кнопку создания дела
    todoItemForm.form.addEventListener('submit', function(e) {
      //эта строчка необходима, чтобы предотвратить стандартное действие браузера
      //в данном случае мы не хотим, чтобы страница перезагружалась при отправке формы
      e.preventDefault();

      //игнорируем создание элемента, если пользователь ничего не ввел в поле
      if (!todoItemForm.input.value) {
        return;
      }
      let rnd = randomNumber();
      let itemDataFromLs = {name: todoItemForm.input.value, done: false, id: rnd}; //создание объекта дела
      let todoItem = createTodoItem(todoItemForm.input.value, itemDataFromLs.id); //создание нового элемента-дела из значения в поле ввода, присвоение Id
      dataFromLs.push(itemDataFromLs); //помещаем этот объект в массив, полученный из localStorage
      localStorage.setItem(key, JSON.stringify(dataFromLs)); //запись массива объектов в localStorage     
      itemButtons(todoItem, key);//вызов функции-обработчика кнопок в элементах списка
      todoList.append(todoItem.item);//создаем и добавляем в список новое дело с названием из поля для ввода 
      todoItemForm.input.value = '';//обнуляем значение в поле, чтобы не пришлось стирать вручную     
      document.querySelector('.btn-primary').setAttribute('disabled', 'disabled');//выключаем кнопку "Добавить Дело"
    });
  }

  window.createTodoApp = createTodoApp;
})();