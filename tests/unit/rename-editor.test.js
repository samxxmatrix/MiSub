import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import RenameEditor from '../../src/components/features/Operators/components/RenameEditor.vue';
import { createI18n } from '../../src/i18n/index.js';

const mountEditor = (modelValue = {}) => mount(RenameEditor, {
  props: { modelValue },
  global: {
    plugins: [createI18n({ initialLocale: 'en-US' })]
  }
});

const findButtonByText = (wrapper, text) => wrapper.findAll('button').find(b => b.text().includes(text));

describe('rename editor', () => {
  it('opens the common regex preset menu on click', async () => {
    const wrapper = mountEditor({ regex: { enabled: true, rules: [] }, template: { enabled: false, template: '', offset: 1 } });

    expect(wrapper.text()).not.toContain('Region-provider-line');

    const trigger = findButtonByText(wrapper, 'Common regex');
    expect(trigger).toBeTruthy();
    await trigger.trigger('click');

    expect(wrapper.text()).toContain('Region-provider-line');
    expect(wrapper.text()).toContain('Extract suffix');
  });

  it('inserts a preset regex rule and closes the menu on selection', async () => {
    const wrapper = mountEditor({ regex: { enabled: true, rules: [] }, template: { enabled: false, template: '', offset: 1 } });

    await findButtonByText(wrapper, 'Common regex').trigger('click');
    await findButtonByText(wrapper, 'Region-provider-line').trigger('click');

    const events = wrapper.emitted('update:modelValue');
    expect(events).toBeTruthy();
    const last = events[events.length - 1][0];
    expect(last.regex.rules).toHaveLength(1);
    expect(last.regex.rules[0].pattern).toBe('\\[(.*?)\\]-(.*?)-(.*)$');
    expect(wrapper.text()).not.toContain('Extract suffix');
  });

  it('applies the server preset template {server}:{port}', async () => {
    const wrapper = mountEditor({ template: { enabled: true, template: '', offset: 1 } });

    await findButtonByText(wrapper, 'Server').trigger('click');

    const events = wrapper.emitted('update:modelValue');
    expect(events).toBeTruthy();
    const last = events[events.length - 1][0];
    expect(last.template.enabled).toBe(true);
    expect(last.template.template).toBe('{server}:{port}');
  });

  it('shows hover tooltips on variable buttons including {sub} and {mysub}', () => {
    const wrapper = mountEditor({ template: { enabled: true, template: '', offset: 1 } });

    const portBtn = findButtonByText(wrapper, '{port}');
    const subBtn = findButtonByText(wrapper, '{sub}');
    const mysubBtn = findButtonByText(wrapper, '{mysub}');

    expect(portBtn).toBeTruthy();
    expect(subBtn).toBeTruthy();
    expect(mysubBtn).toBeTruthy();
    expect(portBtn.attributes('title')).toBeTruthy();
    expect(subBtn.attributes('title')).toBe('Airport subscription name');
    expect(mysubBtn.attributes('title')).toBe('Subscription group name');
  });
});
