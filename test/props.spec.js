import Alpine from 'alpinejs'
import { wait } from '@testing-library/dom'

global.MutationObserver = class {
    observe() {}
}

test('child component can see the props from parent', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <div x-data="{}" x-props="{foo: foo}">
                <span x-text="$props.foo"></span>
            </div>
        </div>
    `

    Alpine.start()

    await wait(() => {
        expect(document.querySelector('span').innerText).toEqual('bar')
    })
})

test('child component updates correctly when props change', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <button x-on:click="foo = 'baz'"></button>
            <div x-data="{}" x-props="{foo: foo}">
                <span x-text="$props.foo"></span>
            </div>
        </div>
    `

    Alpine.start()

    await wait(() => {
        expect(document.querySelector('span').innerText).toEqual('bar')
    })

    document.querySelector('button').click()

    await wait(() => {
        expect(document.querySelector('span').innerText).toEqual('baz')
    })
})

// TODO prevent/warn if child tries to assign to props 
test('child component can *not* update the parent scope', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <span x-text="foo"></span>
            <div x-data="{}" x-props="{foo: foo}">
                <button x-on:click="$props.foo = 'baz'"></button>
                <span id="child-span" x-text="$props.foo"></span>
            </div>
        </div>
    `

    Alpine.start()

    await wait(() => {
        expect(document.querySelector('span').innerText).toEqual('bar')
        expect(document.querySelector('#child-span').innerText).toEqual('bar')
    })

    document.querySelector('button').click()

    await wait(() => {
        expect(document.querySelector('span').innerText).toEqual('bar')
        expect(document.querySelector('#child-span').innerText).toEqual('baz')
    })
})


test('child component supports multiple levels of nesting with explicit props', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <button x-on:click="foo = 'baz'"></button>
            <div x-data="{}" x-props="{prop1: foo}">
                <div x-data="{}" x-props="{prop2: $props.prop1}">
                    <span x-text="$props.prop2"></span>
                </div>
            </div>
        </div>
    `

    Alpine.start()

    await wait(() => {
        expect(document.querySelector('span').innerText).toEqual('bar')
    })

    document.querySelector('button').click()

    await wait(() => {
        expect(document.querySelector('span').innerText).toEqual('baz')
    })
})


test("props work with x-for", async () => {
    document.body.innerHTML = `
     <div x-data="{items: ['item1', 'item2']}">
       <template x-for="(item, index) in items" :key="item">
            <div x-data="{hello:'world'}" x-props="{item: item}">
                <span x-bind:id="'span_'+$props.item" x-text="$props.item"></span>
            </div>
        </template>
     </div>
    `;

    Alpine.start();

    await wait(() => {
        expect(document.querySelector("#span_item1").innerText).toEqual(
            "item1"
        );
        expect(document.querySelector("#span_item2").innerText).toEqual(
            "item2"
        );
    });
});
