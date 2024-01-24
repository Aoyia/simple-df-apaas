**事件控制器设计文档**

1. **总体设计**
   本设计以事件驱动的方式，提供一个全局事件控制器(Event Controller)的功能。事件控制器包含了对各种事件的注册、注销和触发功能。每一个事件都由一个事件实例(Event Instance)对象来表示，该对象包含事件的唯一标识、处理函数、优先级、持久化标志以及关联的Vue组件实例等属性。

2. **事件实例(EventInstance)**
   - `eventCode`: 事件的唯一标识，用于在全局范围内区分不同的事件。
   - `handler`: 事件处理函数，是执行该事件时需要调用的函数。该函数返回一个 Promise 对象，以支持异步操作。
   - `priority`: 事件的优先级，优先级高的事件会优先被触发。
   - `persist`: 事件的持久化标志，如果为 `true`，则该事件在被触发后仍然保留在事件列表中；如果为 `false`，则该事件在被触发后将从事件列表中移除。
   - `vueComponentInstance`: 关联的 Vue 组件实例，该实例由 Vue.extend 方法生成并挂载到 DOM 上。

3. **事件控制器(EventController)**
   - `currentEvent`: 当前正在执行的事件实例。
   - `events`: 所有注册的事件，使用 Map 结构存储，键为事件的唯一标识，值为该标识对应的所有事件实例的数组。

4. **注册事件(register)**
   创建一个新的事件实例，并将其添加到对应事件标识的事件列表中。事件列表会根据事件实例的优先级进行排序。

5. **注销事件(unregister)**
   从事件列表中移除指定的事件实例。如果没有指定事件处理函数，则移除该事件标识对应的所有事件实例。

6. **触发事件(trigger)**
   执行指定事件标识的所有事件实例。首先查找该事件标识是否存在，如果存在，则按照优先级顺序执行每个事件实例的处理函数，并将每个处理函数返回的 Promise 对象的结果存储到结果数组中。在所有事件实例都执行完毕后，返回包含所有结果的 Promise 对象。如果事件实例的持久化标志为 `false`，则在执行完该事件实例后将其从事件列表中移除，并销毁关联的 Vue 组件实例。

7. **关联 Vue 组件实例(associate)**
   将当前正在执行的事件实例与指定的 Vue 组件实例进行关联。如果当前没有正在执行的事件实例，或者当前事件实例已经关联了一个 Vue 组件实例，则不进行关联操作。

8. **使用场景**
   - 注册事件：在 Vue 组件的 `created` 或 `mounted` 钩子中，注册该组件需要触发的事件。
     ```javascript
     EventController.register

("EVENT_NAME", handler, options);
     ```
   - 注销事件：在 Vue 组件的 `beforeDestroy` 钩子中，注销该组件注册的事件。
     ```javascript
     EventController.unregister("EVENT_NAME", handler);
     ```
   - 触发事件：在需要的地方，触发指定的事件。
     ```javascript
     EventController.trigger("EVENT_NAME", ...args);
     ```
   - 关联 Vue 组件实例：在 Vue 组件的 `created` 钩子中，关联该组件的实例。
     ```javascript
     EventController.associate(this);
     ```

通过这种设计，你可以方便地在全局范围内管理和调用各种事件，以及与之关联的 Vue 组件。无论你的应用有多复杂，你都可以通过这种方式来组织和管理你的事件逻辑。