var dragSrcEl;
var listCounter = 0; //maintain list counter
var isTaskClicked = true;
var listArr = []; //array to have all the lists with tasks
document.getElementById('save-board').addEventListener('click',save_board);
document.querySelector('.submit').addEventListener('click', create_list);

// load previoulsy saved board.
function page_load(){
  if(localStorage.getItem('list-details') != null) {
    var data = JSON.parse(localStorage.getItem('list-details'));
    restore_board(data);
  }
}

//attach event listeners for drap an drop events.
function add_event_listener(ele) {
  ele.addEventListener('dragstart', handle_drag_start, false);
  ele.addEventListener('dragover', handle_drag_over, false);
  ele.addEventListener('drop', handle_drop, false);
}

function handle_drag_start(e) {
  // Target (this) element is the source node.
  dragSrcEl = this;
  const id = dragSrcEl.parentNode.parentElement.id;
  const searchQuery = dragSrcEl.firstChild.innerHTML;

  // to get target element index and splice from array
  if (listArr[id].tasks.indexOf(searchQuery) >= 0) {
    for (var i = 0; i < listArr[id].tasks.length; i++) {
        if (listArr[id].tasks[i] === searchQuery) {
            listArr[id].tasks.splice(i,1);
            break;
        }
    }
  }
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handle_drag_over(e) {
  if (e.preventDefault) {
    e.preventDefault(); // Necessary. Allows us to drop.
  }
  e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
  return false;
}

function handle_drop(e) {
  // this/e.target is current target element.
  if (e.stopPropagation) {
    e.stopPropagation(); // Stops some browsers from redirecting.
  }

  if (dragSrcEl != this) {

    dragSrcEl.innerHTML = this.innerHTML;
    var draggedParentId = this.parentNode.parentElement.id;

    var element = dragSrcEl;
    element.parentNode.removeChild(dragSrcEl);

    var child = document.createElement('div');
    child.className = 'swimlane-child card';
    child.setAttribute('draggable', 'true');
    child.innerHTML = e.dataTransfer.getData('text/html');

    var edit = document.createElement('i');
    edit.className = 'material-icons swimlane-edit-task';
    edit.innerHTML = 'mode_edit';
    edit.contentEditable = 'false';
    edit.addEventListener('click',function() {
      toggle_task_editable(this.parentNode);
    });
    child.appendChild(edit);

    listArr[draggedParentId].tasks.push(child.firstChild.innerHTML);

    add_event_listener(child);
    document.querySelectorAll('.swimlane-content')[draggedParentId].insertBefore(child, document.querySelectorAll('.swimlane-text')[draggedParentId]);
  }

  return false;
}

function create_list() {
    let listName = document.getElementById('list-title').value;
    if(listName != '') {
      var wrapper = document.createElement('div');
      wrapper.className = 'swimlane-wrapper';
      wrapper.id = listCounter;
      var content = document.createElement('div');
      content.className = 'swimlane-content';
      var title = document.createElement('div');
      title.className = 'swimlane-title';
      title.innerHTML = listName;
      add_event_listener(title);

      var listObj = {};
      listObj.list_title = listName;
      listObj.tasks = [];
      listArr.push(listObj);
      document.getElementById('save-board').style.visibility = 'visible';

      var addTask = document.createElement('textarea');
      addTask.className = 'swimlane-text';
      addTask.placeholder = 'Add a task';

      var addTaskButton = document.createElement('button');
      addTaskButton.className = 'btn btn-success';
      addTaskButton.innerHTML = 'Add';
      addTaskButton.addEventListener('click', create_task);

      content.appendChild(title);
      content.appendChild(addTask);
      content.appendChild(addTaskButton);
      wrapper.appendChild(content);
      document.querySelector('.content-wrapper')
      .insertBefore(wrapper,document.getElementById('add-list'));
      listCounter++;
    }
}

function create_task(event) {
  var id = event.target.parentNode.parentElement.id;
  var taskEle = document.querySelectorAll('.swimlane-text')[id];

  if(taskEle.value != '') {
    var swimlaneChild = document.createElement('div');
    swimlaneChild.className =  'swimlane-child card';
    swimlaneChild.setAttribute('draggable', true);

    var childTitle = document.createElement('div');
    childTitle.innerHTML = taskEle.value;
    childTitle.className = 'swimlane-task';

    var edit = document.createElement('i');
    edit.className = 'material-icons swimlane-edit-task';
    edit.innerHTML = 'mode_edit';
    edit.contentEditable = 'false';
    edit.addEventListener('click',function() {
      toggle_task_editable(this.parentNode);
    });

    listArr[id].tasks.push(taskEle.value);

    swimlaneChild.appendChild(childTitle);
    swimlaneChild.appendChild(edit);
    add_event_listener(swimlaneChild);

    event.target.parentNode.insertBefore(swimlaneChild, taskEle);
    taskEle.value = '';
  }
}

function toggle_task_editable(ele) {
    if(isTaskClicked) {
      ele.contentEditable = 'true';
      isTaskClicked = false;
    } else {
      const id = ele.parentNode.parentElement.id;
      const newText = ele.firstChild.innerHTML;
      ele.contentEditable = 'false';
      var i = 0, eleClone = ele;
      while( (eleClone = eleClone.previousSibling) != null ){
        i++;
      }
      i--;
      listArr[id].tasks[i] = newText;
      isTaskClicked = true;
    }
}

function save_board() {
  var jsonString = JSON.stringify(listArr);
  localStorage.setItem('list-details', jsonString);
}

function restore_board(data) {
  for (var i = 0; i < data.length; i++) { //loop for total swimlane
    listCounter = data.length;

    var wrapper = document.createElement('div');
    wrapper.className = 'swimlane-wrapper';
    wrapper.id = i;
    var content = document.createElement('div');
    content.className = 'swimlane-content';
    var title = document.createElement('div');
    title.className = 'swimlane-title';
    title.innerHTML = data[i].list_title;
    add_event_listener(title);

    var addTask = document.createElement('textarea');
    addTask.className = 'swimlane-text';
    addTask.placeholder = 'Add a task';

    var addTaskButton = document.createElement('button');
    addTaskButton.className = 'btn btn-success';
    addTaskButton.innerHTML = 'Add';
    addTaskButton.addEventListener('click', create_task);

    content.appendChild(title);
    content.appendChild(addTask);
    content.appendChild(addTaskButton);
    wrapper.appendChild(content);
    document.querySelector('.content-wrapper')
    .insertBefore(wrapper,document.getElementById('add-list'));

    for (var j = 0; j < data[i].tasks.length; j++) { //loop to create task in each swimlane

        var swimlaneChild = document.createElement('div');
        swimlaneChild.className =  'swimlane-child card';
        swimlaneChild.setAttribute('draggable', true);

        var childTitle = document.createElement('div');
        childTitle.innerHTML = data[i].tasks[j];
        childTitle.className = 'swimlane-task';

        var edit = document.createElement('i');
        edit.className = 'material-icons swimlane-edit-task';
        edit.innerHTML = 'mode_edit';
        edit.contentEditable = 'false';
        edit.addEventListener('click',function() {
          toggle_task_editable(this.parentNode);
        });

        listArr = data;
        document.getElementById('save-board').style.visibility = 'visible';

        swimlaneChild.appendChild(childTitle);
        swimlaneChild.appendChild(edit);

        document.querySelectorAll('.swimlane-content')[i]
        .insertBefore(swimlaneChild, addTask);
        add_event_listener(swimlaneChild);
    }

  }
}
